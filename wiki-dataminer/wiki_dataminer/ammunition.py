import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup, Tag

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import get_price, make_id

url = f'{base}/wiki/Final_Fantasy_XII_ammunition'


async def get_ammunition():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get ammunition.")

            text = await response.text()

    results = []

    soup = BeautifulSoup(text, features="html.parser")

    tables = iter(soup.select('table.full-width.FFXII.article-table'))

    for table in tables:
        results.extend(_read_ammunition_table(table))

    return results


def _read_ammunition_table(table: Tag):
    rows = iter(table.select('tbody > tr'))

    # Skip header
    next(rows)

    for row in rows:
        # Columns are: Name, Attack, Evasion, Element, Status, CT, Cmb, Mtl, Value, Licence
        name_cell = row.find(name='th', attrs={'class': 'b'})
        *_unused, price_cell = row.find_all(name='td')

        # The name can either be a string or a tag (usually <a>).
        first_name_part = name_cell.contents[0]

        if isinstance(first_name_part, str):
            name = first_name_part.strip()
        else:
            name = first_name_part.text.strip()

        price = get_price(price_cell.text.strip())

        # TODO I need to add the rest of the stats.
        item = {
            'id': make_id(name),
            'name': name,
            'price': price,
        }

        yield item

        # Some cases span multiple rows, but we only want the first, so skip them.
        rowspan = int(name_cell.attrs.get('rowspan', '1'))

        for _ in range(rowspan - 1):
            next(rows)


async def main():
    ammunition = await get_ammunition()

    for item in ammunition:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
