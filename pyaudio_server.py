# -*- coding: utf-8 -*-
#usar python3
import pyaudio
import wave
import time
import threading

# Globals
CHUNK = 1024
data_stream = bytes()
data_lock = threading.Lock()

def GetNewDataStream ():
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


if __name__ == "__main__":
    t_pyaudio = threading.Thread(target=GetNewDataStream)
    t_pyaudio.start()

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

