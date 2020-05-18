from flask import Flask, render_template
from flask_socketio import SocketIO
import pyaudio
# import wave
import time
import threading
import numpy as np
# import sys

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

""" 
    PyAudio variables and constants
"""
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
BITSPERSAMPLE = 16
audio_dev = pyaudio.PyAudio()
playing = False
yourThread = threading.Thread()

freq = 100
samplerate = 44100
time = 2
frames_qtty = int(samplerate * time)
# generate audio data
data = np.zeros(frames_qtty, dtype=np.int16)
for i in range(frames_qtty):
    data[i] = int(np.sin(np.pi * 2 * freq * i / samplerate) * 32767)

data_bytes = data.tobytes()

"""
    Flask Routes
"""
@app.route('/')
def index():
    return render_template('index.html')
    # return render_template('audio.html')
    # return render_template('audio2.html')
    # return render_template('audio3.html')
    # return render_template('audio4.html')
    

""" 
    Socket-IO
    The names message, json, connect and disconnect are reserved and cannot be used for named events
"""

@socketio.on('connect')
def test_connect():
    # emit('my response', {'data': 'Connected'})
    print('Client Connected!')

    
@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

    
@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)

    
@socketio.on('json')
def handle_json(json):
    print('received json: ' + str(json))


@socketio.on('my event')
def handle_my_custom_event(json):
    global playing
    global audio_stream
    
    print('received json: ' + str(json))
    if json['data'] == 'Button 1 Pressed':
        socketio.emit('messages_list', {'user_name': 'MED', 'message': 'todo way'})

    if json['data'] == 'Button 3 Pressed':
        # key = b'\x13\0\0\0\x08\0'
        # socketio.emit('audio', {'data': key})
        if playing != True:
            playing = True
            print("recording...")
            audio_generation_start()
        else:
            print("stop recording")
            playing = False
        
        # if playing != True:
        #     playing = True
        #     print("recording...")

        #     audio_stream = audio_dev.open(format=FORMAT,
        #                                   channels=CHANNELS,
        #                                   rate=RATE,
        #                                   frames_per_buffer=CHUNK,
        #                                   input=True,
        #                                   stream_callback=audio_input_callback)

        #     audio_stream.start_stream()

        # else:
        #     if audio_stream.is_active():
        #         audio_stream.stop_stream()
        #         audio_stream.close()

        #     print("stop recording")
        #     playing = False



def audio_input_callback(in_data, frame_count, time_info, status):
    socketio.emit('audio', {'data': in_data})
    # print (in_data)
    # print (type(in_data))
    # socketio.emit('audio', {'data': 'mariano '})    
    return (in_data, pyaudio.paContinue)

def audio_generation_callback():
    global playing
    global yourThread
    global pckt_cnt
    global data_bytes
    global time
    
    if playing == True:
        # print (data)
        socketio.emit('audio', {'data': data_bytes})
        # call next loop
        yourThread = threading.Timer(time, audio_generation_callback, ())
        yourThread.start()
        pckt_cnt = pckt_cnt + 1
        print('gen: ' + str(pckt_cnt))


def audio_generation_start():
    global yourThread
    global pckt_cnt    
    # Create your thread
    yourThread = threading.Timer(0.05, audio_generation_callback, ())
    yourThread.start()
    pckt_cnt = 0

# @socketio.on('my event')
# def handle_my_custom_event(arg1, arg2, arg3):
#     print('received args: ' + arg1 + arg2 + arg3)


# Uncalled Server Message
def some_function():
    socketio.emit('some event', {'data': 42})




if __name__ == '__main__':
    socketio.run(app, debug=True)

