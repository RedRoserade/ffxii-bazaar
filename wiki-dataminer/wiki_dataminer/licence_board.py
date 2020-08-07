import asyncio
import json
import logging
from http.client import OK
from pathlib import Path
from typing import Dict, Any

import aiohttp
import matplotlib
import matplotlib.pyplot as plt
import networkx as nx
from bs4 import BeautifulSoup
import numpy as np

log = logging.getLogger(__name__)

_cache_file = Path('_cache', 'licence_board.json')

url = 'https://finalfantasy.fandom.com/wiki/License_Board'

# Mapping of letter to alphabet index (0-based).
_row_idx = {
    ch: idx for idx, ch in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
}

# Mapping of 0-based alphabet index to letter.
_idx_row = {idx: ch for ch, idx in _row_idx.items()}


def next_row(r: str) -> str:
    return _idx_row[(_row_idx[r] + 1)]


def prev_row(r: str) -> str:
    return _idx_row[(_row_idx[r] - 1)]


async def get_licences():
    if _cache_file.exists():
        log.debug("Reading from cache file=%r", _cache_file)

        with _cache_file.open('r') as cache_reader:
            return json.load(cache_reader)

    log.debug("Reading from url=%r", url)

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get licences from %r.", url)

            text = await response.text()

    soup = BeautifulSoup(text, features="html.parser")

    # Find the heading with our desired name.
    heading = soup.find(name='span', attrs={'id': 'Licenses'})

    # The table follows it.
    table = heading.find_next('table')

    licences = []

    rows = iter(table.find_all(name='tr', recursive=False))

    # Skip header
    next(rows)

    id_counter = 0

    for row in rows:
        name_cell = row.find(name='th')
        category_cell, lp_cost_cell, boards_cell, items_cell = row.find_all(name='td')

        name = name_cell.text.strip()
        lp_cost = int(lp_cost_cell.text.strip())

        boards = []

        for c in boards_cell.contents:
            if isinstance(c, str):
                c = c.strip()

                board_name, position = c.split(':')
                is_behind_mist = position[-1] == '*'

                boards.append({
                    'board': board_name.strip(),
                    'position': position.strip().rstrip('*'),
                    'behind_mist': is_behind_mist,
                })

        items = [i.strip() for i in items_cell.text.split(',')]

        licences.append({
            'id': id_counter,
            'category': category_cell.text.strip(),
            'name': name,
            'lp': lp_cost,
            'boards': boards,
            'items': items,
        })

        id_counter += 1

    return licences


def group_licences_by_board(licences):
    boards = {}

    for licence in licences:
        for board in licence['boards']:
            group = boards.setdefault(board['board'], [])

            group.append({**licence, **board})

    return boards


def get_categories(licences):
    categories = set()

    for licence in licences:
        categories.add(licence['category'])

    categories = list(categories)
    categories.sort()

    return categories


def add_board_to_graph(g: nx.Graph, board, idx=0):
    position_node = {n['position']: n for n in board}

    for licence in board:
        pos = licence['position']
        row = pos[0]
        col = int(pos[1:])

        g.add_node(
            licence['id'],
            name=licence['name'],
            category=licence['category'],
            row=row,
            col=col,
            x=_row_idx[row],
            y=col,
            id=licence['id'],
            idx=idx,
            lp=licence['lp'],
        )

    def add_edge(node_u, node_v):
        u = node_u['id']
        v = node_v['id']

        weight = node_v['id']

        # 'Penalize' Summon and Quickening nodes by making them more expensive,
        # and thus, less likely to be taken on the minimum spanning tree algorithms.
        if node_v['category'] == 'Summon':
            weight *= 100

        if node_v['category'] == 'Quickening':
            weight *= 10

        g.add_edge(u, v, behind_mist=node_v['behind_mist'], weight=weight)

    for node_id in g.nodes:
        node = g.nodes[node_id]

        row = node['row']
        col = node['col']

        # Add edges for adjacent nodes.
        # If a licence is on node B3, then the nodes C3, B2, B4, A3 are adjacent, as follows:
        # ----------
        #     A3
        # B2 (B3) B4
        #     C3
        # ----------
        # Provided the adjacent nodes exist on the board.

        # Node above, if not already at the first row
        if row > 'A':
            above = f'{prev_row(row)}{col}'

            if above in position_node:
                add_edge(node, position_node[above])

        # Node below, if not already at the last row
        if row < 'Z':
            below = f'{next_row(row)}{col}'

            if below in position_node:
                add_edge(node, position_node[below])

        # Node to the left, if not already at the first column
        if col > 1:
            left = f'{row}{col - 1}'

            if left in position_node:
                add_edge(node, position_node[left])

        # Node to the right (no bounds check needed)
        right = f'{row}{col + 1}'

        if right in position_node:
            add_edge(node, position_node[right])


def get_graph(licences, wanted_board_names):
    g = nx.Graph()

    boards = group_licences_by_board(licences)

    for board_idx, board_name in enumerate(wanted_board_names):
        board = boards[board_name]
        add_board_to_graph(g, board, idx=board_idx)

    return g


def plot_graph(g: nx.Graph):
    matplotlib.use('TkAgg')

    labels = {}
    node_colors = []

    all_categories = get_categories(g.nodes.values())

    for node_id, node in g.nodes.items():
        if node['category'] in ('Accessory', 'Gambit', 'Essentials', 'Second Board'):
            labels[node_id] = ''  # Remove labels for shared nodes
        else:
            labels[node_id] = node['name']

        node_colors.append(all_categories.index(node['category']))

    # Create a basic layout that mimicks the board
    def get_node_pos(node_id):
        node = g.nodes[node_id]

        # Board offset, to group them.
        x_offset = node['idx'] * 20
        y_offset = node['idx'] * 10

        # 0, 0 is at the bottom left, not top left, so invert y
        x = node['x'] - x_offset
        y = -node['y'] + y_offset

        return np.array([x, y])

    pos = {node_id: get_node_pos(node_id) for node_id in g.nodes}

    nx.draw(
        g,
        pos=pos,
        with_labels=True,
        labels=labels,
        node_color=node_colors,
        style='dotted',
    )

    plt.show()


async def main():
    logging.basicConfig(level=logging.WARNING)
    logging.getLogger(__name__).setLevel(logging.DEBUG)

    licences = await get_licences()

    if not _cache_file.exists():
        _cache_file.parent.mkdir(parents=True, exist_ok=True)

        with _cache_file.open('w') as cache_writer:
            json.dump(licences, cache_writer, indent=2, ensure_ascii=False)

    wanted_board_names = ('Knight',)

    g = get_graph(licences, wanted_board_names)

    # g = nx.minimum_spanning_tree(g, weight='weight')

    plot_graph(g)


if __name__ == '__main__':
    asyncio.run(main())
