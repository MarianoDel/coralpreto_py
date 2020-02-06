# -*- coding: utf-8 -*-
#usar python3
import pyaudio
import wave
import time
import threading
import socket

# Globals
CHUNK = 1024
data_stream = bytes()
data_lock = threading.Lock()

def start_pyaudio ():
    global data_stream

    wf = wave.open("2minutos.wav", 'rb')

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
    server_host = "127.0.0.1"
    server_port = 30000 # arbitrary non-privileged port

    soc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    soc.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    soc.bind((server_host, server_port))
    soc.listen(4)
    print("Socket now listening")

    # infinite loop- do not reset for every requests
    while True:
   
        connection, address = soc.accept()
        ip, port = str(address[0]), str(address[1])
        print("Connected with " + ip + ":" + port)
        try:
            t_s_client = threading.Thread(target=client_connect_handler, args=(connection, ip, port))
        except:
            print("Thread did not start.")

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

    conn.close()
        
        
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

