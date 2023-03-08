import os

response = os.system("ping -c 1 192.168.210.210")

if response == 0:
    print (1)
else:
    print (0)    