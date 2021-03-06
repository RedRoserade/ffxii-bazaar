import json
import re
from os import path
from typing import List, Any

import xlrd
from xlrd.sheet import Cell

from wiki_dataminer.text_parsing import make_id

_AMOUNT = re.compile(r'\sx')


def _remove_xa0(text: str):
    return text.replace('\xa0', ' ')


def _get_row(org: List[Cell]) -> List[Any]:

    def get_cell_value(c: Cell) -> Any:
        val = c.value

        if val is None:
            return None

        if isinstance(val, str):
            return _remove_xa0(val)

        return val

    return [
        get_cell_value(cell)
        for cell in org
    ]


def parse_items(result: str):
    items = (_AMOUNT.split(item_and_amount) for item_and_amount in result.split(','))

    def to_item_and_amount(item_and_amount: List[str]):
        if len(item_and_amount) == 2:
            item, amount = item_and_amount
        else:
            item = item_and_amount[0]
            amount = '1'

        if not item:
            return None

        item_name = item.strip()
        return {
            'item': {
                '_id': make_id(item_name),
                'name': item_name,
                'type': 'loot'
            },
            'quantity': int(amount.strip())
        }

    return [x for x in (to_item_and_amount(i) for i in items) if x is not None]


def parse_price(gil: str):
    if not gil:
        return None

    return int(gil.replace('gil', '').replace(',', '').strip())


def main(args):

    with xlrd.open_workbook(args.path_to_file) as wb:
        sh = wb.sheet_by_index(0)

        rows = sh.get_rows()

        # Skip header
        next(rows)

        raw_recipes = (_get_row(r) for r in rows)

        recipes = []
        items = {}

        for raw in raw_recipes:
            name, result, item, quantity, price, difference = raw

            item = parse_items(item)
            item[0]['quantity'] = int(quantity)

            name_without_star = name.replace('*', '')
            recipe = {
                '_id': make_id(name_without_star),
                'name': name_without_star or None,
                'result': parse_items(result),
                'repeatable': name.endswith('*'),
                'items': item,
                'cost': parse_price(price)
            }

            for i in recipe['items'] + recipe['result']:
                if i is None:
                    continue

                items.setdefault(i['item']['_id'], i['item'])

            if recipe['name'] is None:
                # 'Continuation' of previous recipe. Append items.
                recipes[-1]['result'].extend(recipe['result'])
                recipes[-1]['items'].extend(recipe['items'])
            else:
                # End of recipe.
                recipes.append(recipe)

        with open(path.join(args.output_file, 'recipes.json'), 'w') as json_out:
            # json_out.write('export default ')

            data = {
                'version': 1,
                '_cache': recipes
            }

            json.dump(data, json_out, ensure_ascii=False, indent=4)

        with open(path.join(args.output_file, 'items.json'), 'w') as json_out:
            # json_out.write('export default ')

            data = {
                'version': 1,
                '_cache': list(items.values())
            }

            json.dump(data, json_out, ensure_ascii=False, indent=4)


if __name__ == '__main__':
    import argparse

    arg_parser = argparse.ArgumentParser()

    arg_parser.add_argument('path_to_file')
    arg_parser.add_argument('output_file')

    main(arg_parser.parse_args())
