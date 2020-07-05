# -*- coding: utf-8 -*-
#usar python3
import time

RUNNING_ON_RASP = 0

if RUNNING_ON_RASP:
    from gpios import *
    GpiosInit()


def TestBlue():
    print ("start blinking blue led for 10 secs")

    if RUNNING_ON_RASP:
        LedBlueToggleContinous('start')
    
    time.sleep(10)
    print ("ending toggling")

    if RUNNING_ON_RASP:
        LedBlueToggleContinous('stop')
    
    print ("test ended!")


def TestChannel ():
    channel = ['09', '12', '14', '71', '72', '74', '77', '81']
    for i in range(len(channel)):
        print ("memory: " + str(i) + " test channel: " + channel[i])
        if RUNNING_ON_RASP:
            Channel_to_Memory(channel)

        time.sleep(5)

    print ("test ended!")


def TestPtt():
    print ("PTT on for 5 secs")

    if RUNNING_ON_RASP:
        PttOn()
    
    time.sleep(5)

    if RUNNING_ON_RASP:
        PttOff()
    
    print ("Ptt off")
    print ("test ended!")    


def TestEncendido():
    print ("Encendido on for 5 secs")

    if RUNNING_ON_RASP:
        OnOff_On()
    
    time.sleep(5)

    if RUNNING_ON_RASP:
        OnOff_Off()
    
    print ("Encendido off")
    print ("test ended!")    


def InitialValues ():
    LedBlueOff()
    PttOff()
    OnOff_Off()
    Bit0Off()
    Bit1Off()
    Bit2Off()

    
##############
# Main Tests #
##############
InitialValues()
TestBlue()
TestChannel()
TestPtt()
TestEncendido()
GpiosCleanUp()




