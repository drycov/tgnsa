# netmiko_script.py
import netmiko

from netmiko import ConnectHandler

device = {
    'device_type': 'mikrotik_routeros',
    'ip': '192.168.0.1',
    'port': '22',
    'username': 'admin',
    'password': 'ats60srb',
}

connection = ConnectHandler(**device)
print(connection.find_prompt())
output = connection.send_command('system clock print')
print(output)
connection.disconnect()