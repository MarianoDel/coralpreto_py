# -*- coding: utf-8 -*-
#usar python3
import time
import threading

def TestBlue():
    print ("start blinking blue led for 10 secs")
    LedBlueToggleContinous('start')
    
    time.sleep(5)
    print ("ending toggling")

    LedBlueToggleContinous('stop')
    # time.sleep(3)
    print ("test ended!")

t = threading.Thread()
def LedBlueToggleContinous (action):
    global t
    if action == 'start':
        t = threading.Thread(target=LedBlueToggle_Thread, args=())
        t.start()
        # time.sleep(3)

    if action == 'stop':
        t.do_run = False
        t.join()

    

def LedBlueToggle_Thread ():
    t = threading.currentThread()
    while getattr(t, "do_run", True):
        print ("led blue on")
        time.sleep(1)
        print ("led blue off")
        time.sleep(1)
        
    print ("thread end")

    
##############
# Main Tests #
##############
TestBlue()




