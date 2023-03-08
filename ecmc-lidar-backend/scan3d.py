import socket
from sick_drivers import *
import numpy as np
import time
import math
import json
# LIBRERIA PARA CONEXION MODBUS TCP

from pymodbus.client.sync import ModbusTcpClient

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

MOXA = ModbusTcpClient('192.168.210.211')  # DIRECCION IP DEL I/O REMOTO MOXA

TIM561_START_ANGLE = 0.0  # 2.3561944902   # -135° in rad
TIM561_STOP_ANGLE = 180.0  # -2.3561944902   #  135° in rad

LMS511_START_ANGLE_FIXED = -0.0872665  # -5° inicial fijo
LMS511_STOP_ANGLE_FIXED = 3.22886  # 185° final fijo
LMS511_START_ANGLE_OUTPUTDATA = 3.065  # 175°
LMS511_STOP_ANGLE_OUTPUTDATA = 3.22886  # 185°
LMS511_ANGLE_INCREMENT = 0.00290946386  # 0.1667°

db = ''

if __name__ == '__main__':

    try:
        mongo_client = MongoClient("mongodb://localhost:27017/ecmc_lidar",serverSelectionTimeoutMS=1)
        #mongo_client = MongoClient("mongodb://localhost:27017/ecmc_ia",serverSelectionTimeoutMS=1)
        mongo_client.server_info() # force connection on a request as the connect=True parameter of MongoClient seems to be useless here
        
        db = mongo_client["ecmc_lidar"]

    except ServerSelectionTimeoutError as err:
        pass

    db.sensor.update_one({}, { "$set": { "flag": 1 } })    
    

    MOXA.write_coil(3, False)
    MOXA.write_coil(2, True), time.sleep(1)
    MOXA.write_coil(2, False)
    time.sleep(6)
    MOXA.write_coil(1, True)
    MOXA.write_coil(1, False)
    time.sleep(13)

    # GENERA UN SOCKET PARA CONEXION LMS
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("192.168.210.210", 2112))  # IP LMS511 Y SU PUERTO
    # activate stream
    # ENVIO DE COMANDO PARA LECTURA CONTINUA
    s.send(b'\x02sEN LMDscandata 1\x03\0')
    #s.send(b'\x02sRN LMDscandata\x03\0')

    datagrams_generator = datagrams_from_socket(s)  # RECIBE EL DATAGRAMA
    i = 0

    MOXA.write_coil(0, True)  # ACTIVA LA SALIDA 0 DEL MOXA
    result = MOXA.read_coils(0, 1)  # LEE SU VALOR
    if result.bits[0] == True:  # SI EL VALOR DE LA SALIDA 0 DEL MOXA ES VERDADERA LA DESACTIVA
        # DESACTIVA SALIDA 0 DEL MOXA (ESTO DEBIDO A QUE EL DRIVER NECESITA SOLO UN PULSO PARA REALIZAR EL BARRIDO)
        MOXA.write_coil(0, False)

        params = {}
        params["angulo_inicial"] = int(
            math.degrees(LMS511_START_ANGLE_OUTPUTDATA))
        params["resolucion_angular"] = format(
            math.degrees(LMS511_ANGLE_INCREMENT), '.3f')
        
        #POSICIONES RELEVANTES DEL BARRIDO
        ini = 570
        fin = 900
        while i < 1500: 
             # SE QUEDA MIDIENDO EN UN BUCLE HASTA QUE EL SERVO MOTOR TERMINA EL BARRIDO
            datagram = next(datagrams_generator)
            #print (datagram)
            decoded = decode_datagram(datagram)
            
            
                
            if i > ini and i < fin:
                coords = []  # Lista vacia de coordenadas
                # Obtiene la cantidad de puntos que componen la medida, 1081 aprox. ( 180° / 0.1667° = cantidad de puntos )
                l = len(decoded['Data'])

                if i == ini+1:  # Primera iteración
                    params["frecuencia"] = decoded["ScanningFrequency"]
                    params["numero_serial"] = decoded["SerialNumber"]
                    print(json.dumps(params)+'|')
                
                for z in range(l):  # Recorre los puntos
                    
                    # Obtiene el punto en el eje Y basado en el coseno de la medida y la desplaza en funcion del angulo
                    coor_y = decoded['Data'][z] * np.cos(
                        LMS511_START_ANGLE_OUTPUTDATA + z * LMS511_ANGLE_INCREMENT)
                    # Obtiene el punto en el eje X basado en el seno de la medida y la desplaza en funcion del angulo
                    coor_x = decoded['Data'][z] * np.sin(
                        LMS511_START_ANGLE_OUTPUTDATA + z * LMS511_ANGLE_INCREMENT)

                    if(coor_x != 0 and coor_y != 0):
                        coords.append(str(coor_x)+'_'+str(coor_y))

                if i != fin-1:
                    print(str(coords)+'|')
                else:
                    print(str(coords))

            i += 1


    db.sensor.update_one({}, { "$set": { "flag": 0 } })    

    MOXA.close()
    time.sleep(1)  # CIERRA LA CONEXION MODBUS TCP CON EL MOXA
    # ENVIA COMANDO PARA DETENER MEDICION CONTINUA DEL LMS511
    s.send(b'\x02sEA LMDscandata 0\x03\0')
    MOXA2 = ModbusTcpClient('192.168.210.211')
    time.sleep(1)
    MOXA2.write_coil(3, True)
    MOXA2.close()
    
