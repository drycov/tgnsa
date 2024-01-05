#!/usr/bin/env python3
import asyncio
import sys

from puresnmp import Client, V2C, PyWrapper

def member_ports(string):
    first_four_bytes = string[:4]  # Получаем первые 4 байта

    integer_value = int.from_bytes(first_four_bytes, byteorder='big')
    binary_string = format(integer_value, 'b')   
    return binary_string

ip_address = sys.argv[1]
community = sys.argv[2]

async def member():
    oid = sys.argv[3]
    client = PyWrapper(Client(ip_address, V2C(community)))
    output = await client.get(oid)
    member = member_ports(output)
    return member

async def untagged():
    oid = sys.argv[4]
    client = PyWrapper(Client(ip_address, V2C(community)))
    output = await client.get(oid)
    member = member_ports(output)
    return member

async def forbriden():
    oid = sys.argv[5]
    client = PyWrapper(Client(ip_address, V2C(community)))
    output = await client.get(oid)
    member = member_ports(output)
    return member



def decode_ports(ports_sequence):
    ports_list = []
    for i, bit in enumerate(ports_sequence, 1):
        if bit == '1':
            ports_list.append(str(i))
    return ports_list


def classify_ports(member_ports, untagged_ports):
    member_ports = set(member_ports)
    untagged_ports = set(untagged_ports)

    # Находим порты, отмеченные как untagged
    untagged = list(member_ports.intersection(untagged_ports))
    untagged.sort()

    # Находим порты, которые есть в member_ports, но отсутствуют в untagged_ports
    tagged = list(member_ports.difference(untagged_ports))
    tagged.sort()

    return untagged, tagged

result_member = asyncio.run(member())
result_forbriden = asyncio.run(forbriden())
result_untagged = asyncio.run(untagged())
untagged, tagged = classify_ports(result_member,result_untagged)

print(f"{decode_ports(result_member)}\n{decode_ports(result_untagged)}\n\n{untagged}\n{tagged}")
