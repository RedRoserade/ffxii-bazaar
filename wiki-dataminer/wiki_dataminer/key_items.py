import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup, Tag

from wiki_dataminer.settings import base
from wiki_dataminer.text_parsing import make_id

url = f'{base}/wiki/Final_Fantasy_XII_key_items'


async def get_key_items():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get key items.")

            text = await response.text()

    soup = BeautifulSoup(text, features="html.parser")

    table = soup.find('table', attrs={'class': 'full-width article-table FFXII'})

    return list(_read_items_table(table))


def _read_items_table(table: Tag):
    rows = iter(table.select('tbody > tr'))

    # Skip header
    next(rows)

    for row in rows:
        # Two rows, read in pairs:
        # 1st: Columns are: Name, Action, Location
        # 2nd: In-game description
        name_cell = row.find(name='th', attrs={'class': 'b'})
        action_cell, location_cell = row.find_all(name='td')
        description_cell = next(rows).find('td')

        name = name_cell.text.strip()
        action = action_cell.text.strip()
        location = location_cell.text.strip()
        description = description_cell.text.strip()

        item = {
            'id': make_id(name),
            'name': name,
            'action': action,
            'location': location,
            'description': description,
        }

        yield item


async def main():
    items = await get_key_items()

    for item in items:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
