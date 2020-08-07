import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import process_result, get_price, make_id

url = f'{base}/wiki/Bazaar_(Final_Fantasy_XII)'


async def get_bazaar():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get bazaar page.")

            text = await response.text()

    soup = BeautifulSoup(text, features="html.parser")

    # Find the heading with our desired name.
    heading = soup.find(name='span', attrs={'id': 'Zodiac_versions'})

    # The table follows it.
    table = heading.find_next('table', attrs={'class': 'full-width FFXII article-table'})

    bazaar = []

    rows = iter(table.select('tbody > tr'))

    # Skip header
    next(rows)

    groups = []

    for row in rows:
        current_group = []

        # First row may contain a rowspan. If that's the case,
        # the next n - 1 rows will contain the rest of the items.
        # I will need to iterate into those and group them.
        name_cell = row.find(name='th', attrs={'class': 'b'})
        rowspan = int(name_cell.attrs.get('rowspan', '1'))

        # Append the first row.
        current_group.append(row)

        # And then any following rows until the group is filled.
        while len(current_group) < rowspan:
            row = next(rows)
            current_group.append(row)

        groups.append(current_group)

    for group in groups:
        name_row, *item_rows = group

        # Columns are: Name (Spans), Result with amount (Spans), Item, Amount, Price (Spans), Diff (Spans)
        name_cell = name_row.find(name='th', attrs={'class': 'b'})
        result_cell, item_cell, amount_cell, price_cell, diff_cell = name_row.find_all(name='td')

        name = name_cell.text.strip()
        result_text = result_cell.text.strip()
        items = [_get_item(item_cell, amount_cell)]
        price = price_cell.text.strip()
        diff = diff_cell.text.strip()

        for item_row in item_rows:
            item_cell, amount_cell = item_row.find_all(name='td')
            items.append(_get_item(item_cell, amount_cell))

        repeatable = name[-1] == '*'

        if repeatable:
            name = name.rstrip('*')

        result = process_result(result_text)

        # There's two 'Magick Shard' recipes. One for Holy Motes, and other for Scathe Motes.
        # Treat them differently here.
        if name == 'Magick Shard':
            if any(r['item']['id'] == 'holyMote' for r in result):
                name += ' [Holy Mote]'

            if any(r['item']['id'] == 'scatheMote' for r in result):
                name += ' [Scathe Mote]'

        recipe = {
            'id': make_id(name),
            'name': name,
            'result': result,
            'items': items,
            'price': get_price(price),
            'diff': get_price(diff),
            'repeatable': repeatable
        }

        bazaar.append(recipe)

    return bazaar


def _get_item(item_cell, amount_cell):
    name = item_cell.text.strip()

    return {
        'item': {
            'id': make_id(name),
            'name': name,
        },
        'amount': int(amount_cell.text.strip()),
    }


async def main():
    items = await get_bazaar()

    for item in items:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
