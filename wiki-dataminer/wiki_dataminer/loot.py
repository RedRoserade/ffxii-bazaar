import asyncio
from http.client import OK

import aiohttp
from bs4 import BeautifulSoup

from wiki_dataminer.text_parsing import get_price, get_list

url = 'https://finalfantasy.fandom.com/wiki/Loot_(Final_Fantasy_XII)'


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
            drop = get_list(stats_columns[1].text.strip())
            monograph = get_list(stats_columns[2].text.strip())
            steal = get_list(stats_columns[3].text.strip())
            poach = get_list(stats_columns[4].text.strip())
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


async def main():
    items = await get_loot()

    for item in items:
        print(item)


if __name__ == '__main__':
    asyncio.run(main())
