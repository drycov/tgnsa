# netmiko_script.py
import netmiko

from netmiko import ConnectHandler

device = {
    'device_type': 'mikrotik_routeros',
    'host': '192.168.0.1',
    'port': '22',
    'username': 'admin',
    'password': 'admin',
}

connection = ConnectHandler(**device)
print(connection.find_prompt())
output = connection.send_command('ip add p')
print(output)
connection.disconnect()
