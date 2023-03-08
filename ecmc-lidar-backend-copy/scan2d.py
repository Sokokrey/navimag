import socket
from sick_drivers import *
import numpy as np
import json
import math

TIM561_START_ANGLE = 0.0 #2.3561944902   # -135° in rad   
TIM561_STOP_ANGLE = 180.0#-2.3561944902   #  135° in rad     

LMS511_START_ANGLE_FIXED = -0.0872665 #-5° inicial fijo
LMS511_STOP_ANGLE_FIXED = 3.22886 #185° final fijo
LMS511_START_ANGLE_OUTPUTDATA =  3.065 #45° #3.065  #-5°
LMS511_STOP_ANGLE_OUTPUTDATA = 3.66519 #185°
LMS511_ANGLE_INCREMENT = 0.00290946386 #0.00436332 #0.25° #0.00872665 #0.5° 0.00290946386 #0.1667°   

if __name__ == '__main__':

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("192.168.210.210", 2112))  
    # activate stream
    s.send(b'\x02sEN LMDscandata 1\x03\0')
    #s.send(b'\x02sEN LFEinfringementinfo 1\x03\0')

    datagrams_generator = datagrams_from_socket(s) 
    
    params = {}
    params["angulo_inicial"] = int(
        math.degrees(LMS511_START_ANGLE_OUTPUTDATA))
    params["resolucion_angular"] = format(
        math.degrees(LMS511_ANGLE_INCREMENT), '.3f')

    i = 0
    fin = 5
    while i < fin:          
        datagram = next(datagrams_generator)  
        decoded = decode_datagram(datagram)  
        
        if type(decoded) is dict:
            coords = [] #Lista vacia de coordenadas
            
            if (i == 1):  # Primera iteración
                
                params["frecuencia"] = decoded["ScanningFrequency"]
                params["numero_serial"] = decoded["SerialNumber"]
                print(json.dumps(params)+'|')
                
            l = len(decoded['Data']) #Obtiene la cantidad de puntos que componen la medida, 1081 aprox. ( 180° / 0.1667° = cantidad de puntos )
            for z in range(l): #Recorre los puntos  

                coor_y = decoded['Data'][z] * np.cos(LMS511_START_ANGLE_OUTPUTDATA + z * LMS511_ANGLE_INCREMENT); #Obtiene el punto en el eje Y basado en el seno de la medida y la desplaza en funcion del angulo 
                coor_x = decoded['Data'][z] * np.sin(LMS511_START_ANGLE_OUTPUTDATA + z * LMS511_ANGLE_INCREMENT); #Obtiene el punto en el eje X basado en el coseno de la medida y la desplaza en funcion del angulo
                coords.append(str(coor_x)+'_'+str(coor_y))

            if i == fin-1:
                print(str(coords)+'|')
            else:
                print(str(coords))
                
        i += 1
