# -*- coding: utf-8 -*-
#usar python3
import time

RUNNING_ON_RASP = 1

if RUNNING_ON_RASP:
    from gpios import *
    GpiosInit()


def TestBlueStart():
    if RUNNING_ON_RASP:
        LedBlueToggleContinous('start')

        
def TestBlueStop():
    if RUNNING_ON_RASP:
        LedBlueToggleContinous('stop')
    
        
def TestChannel ():
    channel = ['09', '12', '14', '71', '72', '74', '77', '81']
    for i in range(len(channel)):
        print ("memory: " + str(i) + " test channel: " + channel[i])
        if RUNNING_ON_RASP:
            Channel_to_Memory(channel)

        time.sleep(5)

    print ("memory test ended!")


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
    Bit0Off()
    Bit1Off()
    Bit2Off()
    OnOff_On()
    

    
##############
# Main Tests #
##############
InitialValues ()
print ("enciendo radio")
time.sleep(3)
print ("blue blinking")
TestBlueStart()
TestChannel()
print ("blue stop")
TestBlueStop()
print ("apago radio")
OnOff_Off()
print ("test ended!")
# TestPtt()
# TestEncendido()
GpiosCleanUp()
print ("test radio ended!")



