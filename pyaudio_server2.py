# -*- coding: utf-8 -*-
#usar python3
import pyaudio
import wave
import time
import threading
import socket
from general_config import GeneralConfiguration

""" Contesto los chunks del wav hasta terminar de leerlo """
""" uso pyaudio como timing del wav """
""" los chunks sincronizados los uso como globales """

# Globals - configurations variables and constants
conf = GeneralConfiguration
CHUNK = conf.audio_chunk
wav_file = conf.filename
server_host = conf.pyaudio_server_ip
server_port = conf.pyaudio_server_port

data_stream = bytes()
data_lock = threading.Lock()

def start_pyaudio ():
    global data_stream

    wf = wave.open(wav_file, 'rb')

    # instantiate PyAudio (1)
    p = pyaudio.PyAudio()

    # open stream (2)
    stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                    channels=wf.getnchannels(),
                    rate=wf.getframerate(),
                    output=True)

    # read data
    data = wf.readframes(CHUNK)

    # play stream (3)
    while len(data) > 0:
        stream.write(data)

        # save global values
        data_lock.acquire()
        data_stream = data
        data_lock.release()

        data = wf.readframes(CHUNK)

    # stop stream (4)
    stream.stop_stream()
    stream.close()

    # close PyAudio (5)
    p.terminate()


def start_server():
    s_host = server_host
    s_port = server_port

    soc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    soc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    soc.bind((s_host, s_port))

    soc.listen(4)
    print("Socket now listening")

    # infinite loop- do not reset for every requests
    while True:
   
        connection, address = soc.accept()
        ip, port = str(address[0]), str(address[1])
        print("Connected with " + ip + ":" + port)
        try:
            t_s_client = threading.Thread(target=client_connect_handler, args=(connection, ip, port))
            t_s_client.start()
        except:
            print("Thread did not start.")
            break

    soc.close()


def client_connect_handler(conn, ip, port):
    global data_stream
    
    while True:
        # con cualquier cosa que recibo contesto el data_stream
        data = conn.recv(1024)
        if not data:
            print (f"closed conn: {ip}:{port}")
            break

        data_lock.acquire()
        data = data_stream
        data_lock.release()
        conn.send(data)

    # conn.close()
    # print("on new thread")
    # while True:
    #     data = conn.recv(1024)
    #     if not data:
    #         print (f"closed conn: {ip}:{port}")
    #         break

    #     conn.send(b"hola")

    # conn.close()
        
        
if __name__ == "__main__":
    t_pyaudio = threading.Thread(target=start_pyaudio)
    t_pyaudio.start()
    t_server = threading.Thread(target=start_server)
    t_server.start()

    new_data = bytes()
    frames_num = 0
    while t_pyaudio.is_alive():

        if new_data != data_stream:
            frames_num += 1
            # print (f"new_frame: {frames_num}")
            data_lock.acquire()
            new_data = data_stream
            data_lock.release()


    print (f"ended bytes count: {frames_num * CHUNK}")
    t_pyaudio.join()

