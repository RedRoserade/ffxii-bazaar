import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup, Tag

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import get_price, get_list

url = f'{base}/wiki/Loot_(Final_Fantasy_XII)'


async def get_loot():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get loot.")

            text = await response.text()

    soup = BeautifulSoup(text, features="html.parser")

    tables = soup.find_all(name='table', attrs={'class': 'full-width article-table FFXII'})

    items = []

    for table in tables:

        rows = table.find_all(name='tr', recursive=False)

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

            description = description_row.find('td', attrs={'colspan': '6'}).text.strip()

            items.append({
                'name': name,
                'price': price,
                'drop': drop,
                'monograph': monograph,
                'steal': steal,
                'poach': poach,
                'reward': reward,
                'description': description,
            })

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


async def main():
    items = await get_loot()

    for item in items:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
