# -*- coding: utf-8 -*-
#usar python3
import RPi.GPIO as GPIO
import threading
import time

###########################################
# Seteo Inicial de todos los GPIOs a usar #
###########################################
LED_B = 14    #led blue servidor gpio14
ON_OFF = 15
PTT = 18
BIT2 = 23
BIT1 = 24
BIT0 = 25

def GpiosInit():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LED_B, GPIO.OUT)
    GPIO.setup(ON_OFF, GPIO.OUT)
    GPIO.setup(PTT, GPIO.OUT)
    GPIO.setup(BIT2, GPIO.OUT)
    GPIO.setup(BIT1, GPIO.OUT)
    GPIO.setup(BIT0, GPIO.OUT)        


def GpiosCleanUp():
    GPIO.cleanup()

    
#############
# LED Blue #
#############
def LedBlueOn():
    GPIO.output(LED_B, GPIO.HIGH)


def LedBlueOff():
    GPIO.output(LED_B, GPIO.LOW)


def LedBlueToggle():
    if GPIO.input(LED_B) == 0:
        GPIO.output(LED_B, GPIO.HIGH)
    else:
        GPIO.output(LED_B, GPIO.LOW)

        
already_toggling = 0
t = threading.Thread()
def LedBlueToggleContinous(action):
    global already_toggling
    global t

    if action == 'start':
        if not already_toggling:
            already_toggling = 1
            t = threading.Thread(target=LedBlueToggle_Thread, args=())
            t.start()
            
    elif action == 'stop':
        if already_toggling:
            t.do_run = False
            LedBlueOff()
            already_toggling = 0
            t.join()


def LedBlueToggle_Thread():
    t = threading.currentThread()
    while getattr(t, "do_run", True):
        LedBlueOn()
        time.sleep(1.3)
        LedBlueOff()
        time.sleep(0.7)
        
        
##############
# ON/OFF Pin #
##############
def OnOff_On():
    GPIO.output(ON_OFF, GPIO.HIGH)


def OnOff_Off():
    GPIO.output(ON_OFF, GPIO.LOW)


def OnOff_Toggle():
    if GPIO.input(ON_OFF) == 0:
        GPIO.output(ON_OFF, GPIO.HIGH)
    else:
        GPIO.output(ON_OFF, GPIO.LOW)


#######
# Ptt #
#######
def PttOn():
    GPIO.output(PTT, GPIO.HIGH)


def PttOff():
    GPIO.output(PTT, GPIO.LOW)


# def BuzzerPulse(timer):
#     start_new_thread(BuzzerPulse_Thread, (timer,))


# def BuzzerPulse_Thread(timer):
#     BuzzerOn()
#     time.sleep(timer)
#     BuzzerOff()

    
########
# Bit2 #
########
def Bit2On():
    GPIO.output(BIT2, GPIO.HIGH)


def Bit2Off():
    GPIO.output(BIT2, GPIO.LOW)


########
# Bit1 #
########
def Bit1On():
    GPIO.output(BIT1, GPIO.HIGH)


def Bit1Off():
    GPIO.output(BIT1, GPIO.LOW)


########
# Bit0 #
########
def Bit0On():
    GPIO.output(BIT0, GPIO.HIGH)


def Bit0Off():
    GPIO.output(BIT0, GPIO.LOW)

    
def Channel_to_Memory (channel_string):

    # memory 0
    if channel_string == '09':
        Bit0Off();
        Bit1Off();
        Bit2Off();

    # memory 1        
    if channel_string == '12':
        Bit0On();
        Bit1Off();
        Bit2Off();

    # memory 2
    if channel_string == '14':
        Bit0Off();
        Bit1On();
        Bit2Off();

    # memory 3
    if channel_string == '71':
        Bit0On();
        Bit1On();
        Bit2Off();

    # memory 4
    if channel_string == '72':
        Bit0Off();
        Bit1Off();
        Bit2On();

    # memory 5
    if channel_string == '74':
        Bit0On();
        Bit1Off();
        Bit2On();

    # memory 6
    if channel_string == '77':
        Bit0Off();
        Bit1On();
        Bit2On();

    # memory 7
    if channel_string == '81':
        Bit0On();
        Bit1On();
        Bit2On();


def Memory_to_Channel ():

    # memory 0
    if (GPIO.input(BIT0) == 0 and \
        GPIO.input(BIT1) == 0 and \
        GPIO.input(BIT2) == 0):
        return '09'

    # memory 1        
    if (GPIO.input(BIT0) == 1 and \
        GPIO.input(BIT1) == 0 and \
        GPIO.input(BIT2) == 0):
        return '12'

    # memory 2
    if (GPIO.input(BIT0) == 0 and \
        GPIO.input(BIT1) == 1 and \
        GPIO.input(BIT2) == 0):
        return '14'

    # memory 3
    if (GPIO.input(BIT0) == 1 and \
        GPIO.input(BIT1) == 1 and \
        GPIO.input(BIT2) == 0):
        return '71'

    # memory 4
    if (GPIO.input(BIT0) == 0 and \
        GPIO.input(BIT1) == 0 and \
        GPIO.input(BIT2) == 1):
        return '72'

    # memory 5
    if (GPIO.input(BIT0) == 1 and \
        GPIO.input(BIT1) == 0 and \
        GPIO.input(BIT2) == 1):
        return '74'

    # memory 6
    if (GPIO.input(BIT0) == 0 and \
        GPIO.input(BIT1) == 1 and \
        GPIO.input(BIT2) == 1):
        return '77'

    # memory 7
    if (GPIO.input(BIT0) == 1 and \
        GPIO.input(BIT1) == 1 and \
        GPIO.input(BIT2) == 1):
        return '81'





    
