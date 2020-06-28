import asyncio
from http.client import OK
from typing import Dict, Any

import aiohttp
import matplotlib
import networkx as nx
import matplotlib.pyplot as plt
from bs4 import BeautifulSoup
from networkx.drawing.nx_agraph import graphviz_layout

url = 'https://finalfantasy.fandom.com/wiki/License_Board'

_row_idx = {
    ch: idx for idx, ch in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
}

_idx_row = {idx: ch for ch, idx in _row_idx.items()}


def next_row(r: str) -> str:
    return _idx_row[(_row_idx[r] + 1)]


def prev_row(r: str) -> str:
    return _idx_row[(_row_idx[r] - 1)]


async def get_licences():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != OK:
                raise RuntimeError("Could not get data.")

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


def add_board_to_graph(g: nx.Graph, board):
    position_node = {n['position']: n for n in board}

    for licence in board:
        g.add_node(licence['id'], name=licence['name'], category=licence['category'])

    for pos, node in position_node.items():
        node_id = node['id']
        row = pos[0]
        col = int(pos[1:])

        # Add edges for adjacent nodes.
        # If a licence is on node B3, then the nodes C3, B2, B4, A3 are adjacent, as follows:
        # ----------
        #     A3
        # B2 (B3) B4
        #     C3
        # ----------
        # Provided the nodes exist on the board.

        # Node above, if not already at the first row
        if row > 'A':
            above = f'{prev_row(row)}{col}'

            if above in position_node:
                g.add_edge(node_id, position_node[above]['id'], behind_mist=position_node[above]['behind_mist'])

        # Node below, if not already at the last row
        if row < 'Z':
            below = f'{next_row(row)}{col}'

            if below in position_node:
                g.add_edge(node_id, position_node[below]['id'], behind_mist=position_node[below]['behind_mist'])

        # Node to the left, if not already at the first column
        if col > 1:
            left = f'{row}{col - 1}'

            if left in position_node:
                g.add_edge(node_id, position_node[left]['id'], behind_mist=position_node[left]['behind_mist'])

        # Node to the right (no bounds check needed)
        right = f'{row}{col + 1}'

        if right in position_node:
            g.add_edge(node_id, position_node[right]['id'], behind_mist=position_node[right]['behind_mist'])


def get_graph(licences, wanted_board_names):
    g = nx.Graph()

    boards = group_licences_by_board(licences)

    for board_name in wanted_board_names:
        board = boards[board_name]
        add_board_to_graph(g, board)

    # noinspection PyTypeChecker
    degrees: Dict[Any, int] = g.degree

    nodes_behind_mist = {}

    for node_id, attrs in g.nodes.items():
        edges = g[node_id]

        if degrees[node_id] < 2:
            nodes_to_add = []

            for adj_node_id in edges:
                adj_node = g.nodes[adj_node_id]

                if adj_node['category'] in ('Summon', 'Quickening'):
                    nodes_behind_mist[adj_node_id] = nodes_to_add

    return g


def plot_graph(g: nx.Graph):
    labels = {}
    node_colors = []

    all_categories = get_categories(g.nodes.values())

    for node_id, node in g.nodes.items():
        if node['category'] in ('Accessory', 'Gambit', 'Essentials', 'Second Board'):
            labels[node_id] = ''  # Remove labels for shared nodes
        else:
            labels[node_id] = node['name']

        node_colors.append(all_categories.index(node['category']))

    pos = graphviz_layout(g, root=0)

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
    matplotlib.use('TkAgg')

    licences = await get_licences()

    wanted_board_names = ('Bushi',)

    g = get_graph(licences, wanted_board_names)

    plot_graph(g)


if __name__ == '__main__':
    asyncio.run(main())
