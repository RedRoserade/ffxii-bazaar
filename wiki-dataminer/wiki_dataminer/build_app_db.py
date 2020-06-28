import argparse
import asyncio
import json

from wiki_dataminer.bazaar import get_bazaar
from wiki_dataminer.items import get_items
from wiki_dataminer.key_items import get_key_items
from wiki_dataminer.loot import get_loot


class AppDb:
    def __init__(self):
        self.items = []
        self.key_items = []
        self.loot = []
        self.bazaar_recipes = []

    async def load_data(self):
        self.items, self.key_items, self.loot, self.bazaar_recipes = await asyncio.gather(
            get_items(),
            get_key_items(),
            get_loot(),
            get_bazaar(),
        )

    def build_recipes_file(self, filename):
        item_ids = {item['id'] for item in self.items}
        key_item_ids = {item['id'] for item in self.key_items}
        loot_ids = {item['id'] for item in self.loot}

        def get_item_type(item):
            item_id = item['id']

            if item_id in item_ids:
                return 'item'

            if item_id in key_item_ids:
                return 'keyItem'

            if item_id in loot_ids:
                return 'loot'

            return None

        def get_recipe_item(item):
            return {
                'item': {
                    '_id': item['item']['id'],
                    'name': item['item']['name'],
                    'type': get_item_type(item['item']),
                },
                'quantity': item['amount'],
            }

        data = [
            {
                '_id': r['id'],
                'name': r['name'],
                'repeatable': r['repeatable'],
                'items': [get_recipe_item(item) for item in r['items']],
                'result': [get_recipe_item(item) for item in r['result']],
                'cost': r['price'],
            }
            for r in self.bazaar_recipes
        ]

        contents = {
            'version': 2,
            'data': data
        }

        with open(filename, 'w') as writer:
            json.dump(contents, writer, ensure_ascii=False, indent=2)

    def build_items_file(self, filename):
        data = []

        # Unconditionally add the loot.
        data.extend(
            {
                '_id': item['id'],
                'name': item['name'],
                'type': 'loot',
            }
            for item in self.loot
        )

        # Only add the remainder of the items if they are involved in at least one recipe,
        # either as an input or an output.
        item_ids_in_recipes = set()

        for recipe in self.bazaar_recipes:
            for item in recipe['items']:
                item_ids_in_recipes.add(item['item']['id'])

            for result in recipe['result']:
                item_ids_in_recipes.add(result['item']['id'])

        data.extend(
            {
                '_id': item['id'],
                'name': item['name'],
                'type': 'item',
            }
            for item in self.items
            if item['id'] in item_ids_in_recipes
        )

        data.extend(
            {
                '_id': item['id'],
                'name': item['name'],
                'type': 'keyItem',
            }
            for item in self.key_items
            if item['id'] in item_ids_in_recipes
        )

        contents = {
            'version': 2,
            'data': data,
        }

        with open(filename, 'w') as writer:
            json.dump(contents, writer, ensure_ascii=False, indent=2)


async def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('--recipes-file', required=True)
    parser.add_argument('--items-file', required=True)

    args = parser.parse_args()

    db = AppDb()

    await db.load_data()

    db.build_items_file(args.items_file)
    db.build_recipes_file(args.recipes_file)


if __name__ == '__main__':
    asyncio.run(main())
