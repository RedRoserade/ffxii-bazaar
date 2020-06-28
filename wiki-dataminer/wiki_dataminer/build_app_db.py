import argparse
import asyncio
import json

from wiki_dataminer.accessories import get_accessories
from wiki_dataminer.ammunition import get_ammunition
from wiki_dataminer.armour import get_armour
from wiki_dataminer.bazaar import get_bazaar
from wiki_dataminer.items import get_items
from wiki_dataminer.key_items import get_key_items
from wiki_dataminer.loot import get_loot
from wiki_dataminer.weapons import get_weapons


class AppDb:
    version = 6

    def __init__(self):
        self.items = []
        self.key_items = []
        self.weapons = []
        self.armour = []
        self.accessories = []
        self.loot = []
        self.ammunition = []
        self.bazaar_recipes = []

    async def load_data(self):
        self.items, self.key_items, self.loot, self.weapons, self.armour, self.accessories, self.ammunition, self.bazaar_recipes = await asyncio.gather(
            get_items(),
            get_key_items(),
            get_loot(),
            get_weapons(),
            get_armour(),
            get_accessories(),
            get_ammunition(),
            get_bazaar(),
        )

    def build_recipes_file(self, filename):
        item_ids = {item['id'] for item in self.items}
        key_item_ids = {item['id'] for item in self.key_items}
        weapon_ids = {item['id'] for item in self.weapons}
        armour_ids = {item['id'] for item in self.armour}
        ammunition_ids = {item['id'] for item in self.ammunition}
        accessory_ids = {item['id'] for item in self.accessories}
        loot_ids = {item['id'] for item in self.loot}

        def get_item_type(item):
            item_id = item['id']

            if item_id in item_ids:
                return 'item'

            if item_id in key_item_ids:
                return 'keyItem'

            if item_id in loot_ids:
                return 'loot'

            if item_id in weapon_ids:
                return 'weapon'

            if item_id in armour_ids:
                return 'armour'

            if item_id in accessory_ids:
                return 'accessory'

            if item_id in ammunition_ids:
                return 'ammunition'

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
            'version': self.version,
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

        extra_items = {
            'item': self.items,
            'keyItem': self.key_items,
            'accessory': self.accessories,
            'armour': self.armour,
            'weapon': self.weapons,
            'ammunition': self.ammunition,
        }

        for item_type, items in extra_items.items():
            data.extend(
                {
                    '_id': item['id'],
                    'name': item['name'],
                    'type': item_type,
                }
                for item in items
                if item['id'] in item_ids_in_recipes
            )

        contents = {
            'version': self.version,
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
