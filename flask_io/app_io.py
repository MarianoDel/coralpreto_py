from flask import Flask, render_template
from flask_socketio import SocketIO
import pyaudio
# import wave
# import time
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
        key = b'\x13\0\0\0\x08\0'
        socketio.emit('audio', {'data': key})    
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
    print (in_data)
    print (type(in_data))
    # socketio.emit('audio', {'data': 'mariano '})    
    return (in_data, pyaudio.paContinue)

# @socketio.on('my event')
# def handle_my_custom_event(arg1, arg2, arg3):
#     print('received args: ' + arg1 + arg2 + arg3)


# Uncalled Server Message
def some_function():
    socketio.emit('some event', {'data': 42})




if __name__ == '__main__':
    socketio.run(app, debug=True)

