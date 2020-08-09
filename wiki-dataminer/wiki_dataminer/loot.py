import asyncio
import json
import logging
from http.client import OK
from pathlib import Path

import aiohttp
from bs4 import BeautifulSoup, Tag

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import get_price, get_list, make_id

log = logging.getLogger(__name__)

_cache_file = Path('_cache', 'loot.json')

url = f'{base}/wiki/Loot_(Final_Fantasy_XII)'


async def get_loot():

    if _cache_file.exists():
        log.debug("Reading from cache file=%r", _cache_file)

        with _cache_file.open('r') as cache_reader:
            return json.load(cache_reader)

    item_order = _get_item_order()
    quest_items = _get_quest_items()

    log.debug("Reading from url=%r", url)

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get loot.")

            text = await response.text()

    soup = BeautifulSoup(text, features="html.parser")

    tables = soup.select('table.full-width.article-table.FFXII')

    items = []

    for table in tables:

        rows = table.select('tbody > tr')

        # Skip header row.
        rows = iter(rows)
        next(rows)

        item_row_groups = []
        current_row_group = []

        for row in rows:
            # Each group of 3 rows is an item.
            if len(current_row_group) == 3:
                item_row_groups.append(current_row_group)
                current_row_group = []

            current_row_group.append(row)

        # Catch any last row.
        if len(current_row_group) == 3:
            item_row_groups.append(current_row_group)

        for row_group in item_row_groups:
            if len(row_group) != 3:
                print("Cannot process", row_group)
                continue

            # First row contains 6 columns: Name, Price, Drop, Monograph drop, Steal, Poach, Reward(s)
            # Second row is uses (we don't use it)
            # Third row is a description
            stats_row, uses_row, description_row = row_group

            name = stats_row.find(name='th', attrs={'class': 'b'}).text.strip()
            stats_columns = list(stats_row.find_all(name='td'))

            if len(stats_columns) != 6:
                print('Cannot process', stats_columns)
                continue

            price = get_price(stats_columns[0].text.strip())
            drop = _get_list(stats_columns[1])
            monograph = _get_list(stats_columns[2])
            steal = _get_list(stats_columns[3])
            poach = _get_list(stats_columns[4])
            reward = get_list(stats_columns[5].text.strip(), sep='\n')
            index = None

            description = description_row.find('td', attrs={'colspan': '6'}).text.strip()

            if name not in item_order:
                log.debug("%r has no order set", name)
            else:
                index = item_order.pop(name)

            item = {
                'id': make_id(name),
                'name': name,
                'price': price,
                'drop': drop,
                'monograph': monograph,
                'steal': steal,
                'poach': poach,
                'reward': reward,
                'description': description,
                'quest_item': name in quest_items,
            }

            if index is not None:
                item['index'] = index

            items.append(item)

    for missing_name in item_order:
        log.warning("%r was not in the input list", missing_name)

    return items


def _get_list(root: Tag):
    result = []

    for child in root.children:

        # if isinstance(child, str):
        #     if child.strip() == 'N/A':
        #         continue

        if isinstance(child, Tag):

            current = {'name': ''}

            if child.name == 'a':
                current['name'] += child.get_text(strip=True)
                current['link'] = f'{base}{child.attrs["href"]}'

            result.append(current)

    return result


def _get_item_order():
    item_order_file = Path(Path(__file__).parent, 'item-order.txt')

    order_by_name = {}

    with item_order_file.open('r') as item_order_reader:
        idx = 0

        for line in item_order_reader:
            line = line.strip()

            if not line or line[0] == '#':
                continue

            order_by_name[line] = idx
            idx += 1

    return order_by_name


def _get_quest_items() -> dict:
    file_path = Path(Path(__file__).parent, 'quest_items.json')

    with file_path.open('r') as file_reader:
        quest_item_list = json.load(file_reader)

    return {item['name']: item for item in quest_item_list}


async def main():
    logging.basicConfig(level=logging.INFO)

    items = await get_loot()

    if not _cache_file.exists():
        _cache_file.parent.mkdir(parents=True, exist_ok=True)

        with _cache_file.open('w') as cache_writer:
            json.dump(items, cache_writer, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    asyncio.run(main())
