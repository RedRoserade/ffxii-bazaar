import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup, Tag

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import get_price, make_id

url = f'{base}/wiki/Final_Fantasy_XII_items'


async def get_items():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get items.")

            text = await response.text()

    results = []

    soup = BeautifulSoup(text, features="html.parser")

    # Find the heading with our desired name.
    # It's in the order:
    # 1. span (for the heading)
    # 2. dt (for the subsection, for which we want only the Zodiac)
    # 3. table (with the items)
    heading_ids = ('Restorative_items', 'Offensive.2Fsupport_items')

    for heading_id in heading_ids:
        section = soup.find('span', id=heading_id)
        heading = section.find_next(name='dt', text='Zodiac\n')
        table = heading.find_next('table', attrs={'class': 'full-width FFXII article-table'})

        results.extend(_read_items_table(table))

    return results


def _read_items_table(table: Tag):
    rows = iter(table.find_all(name='tr', recursive=False))

    # Skip header
    next(rows)

    for row in rows:
        # Columns are: Name, Description, Value
        name_cell = row.find(name='th', attrs={'class': 'b'})
        description_cell, price_cell, *_ = row.find_all(name='td')

        name = name_cell.text.strip()
        description = description_cell.text.strip()
        price = get_price(price_cell.text.strip())

        item = {
            'id': make_id(name),
            'name': name,
            'description': description,
            'price': price,
        }

        yield item

        # Some cases span multiple rows, but we only want the first, so skip them.
        rowspan = int(name_cell.attrs.get('rowspan', '1'))

        for _ in range(rowspan - 1):
            next(rows)


async def main():
    items = await get_items()

    for item in items:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
