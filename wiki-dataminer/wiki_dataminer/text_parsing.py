import re

non_numbers = re.compile(r'\D')
amount_re = re.compile(r'^(?P<name>.+)\sx(?P<amount>\d+)?$')


def process_result(t: str):
    items = t.split(',')

    result = []

    for item in items:
        item = item.strip()

        match = amount_re.search(item)

        if match is None:
            result.append({'item': item, 'amount': 1})
        else:
            name = match.group('name')
            amount = int(match.group('amount'))

            result.append({'item': name, 'amount': amount})

    return result


def get_list(original_str, sep=','):
    if original_str == 'N/A':
        return []

    return [{'name': i.strip()} for i in original_str.split(sep)]


def get_price(price_str):
    if price_str == 'N/A':
        return None

    value = int(non_numbers.sub('', price_str))

    if price_str[0] == '-':
        value *= -1

    return value
