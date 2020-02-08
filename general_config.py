# -*- coding: utf-8 -*-
#usar python3


import pyaudio

""" Archivo de configuracion general para servers """
""" - sockets - pyaudio - wave - flask - """

class GeneralConfiguration ():
    # para pyaudio
    audio_chunk = 1024
    pyaudio_server_ip = "127.0.0.1"
    pyaudio_server_port = 30000 # arbitrary non-privileged port

    # para wave tests
    filename = "2minutos.wav"
    

