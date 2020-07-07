from flask import Flask
from flask import Flask, flash, redirect, render_template, request, session, abort, Response, url_for
from flask_socketio import SocketIO
import json
import pyaudio
import os

import threading
import numpy as np

### GLOBALS FOR CONFIGURATION #########
## OS where its run
RUNNING_ON_SLACKWARE = 1
RUNNING_ON_RASP = 0

app = Flask(__name__)
app.secret_key = os.urandom(12)
socketio = SocketIO(app)

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
BITSPERSAMPLE = 16

# RECORD_SECONDS = 5

audio_dev = pyaudio.PyAudio()

## init of gpios and steady state
if RUNNING_ON_RASP:
    from gpios import *
    GpiosInit()
    PttOff()
    LedBlueOff()
    OnOff_On()
    Channel_to_Memory('12')


def genHeader(sampleRate, bitsPerSample, channels):
    datasize = 2000*10**6
    o = bytes("RIFF",'ascii')                                               # (4byte) Marks file as RIFF
    o += (datasize + 36).to_bytes(4,'little')                               # (4byte) File size in bytes excluding this and RIFF marker
    o += bytes("WAVE",'ascii')                                              # (4byte) File type
    o += bytes("fmt ",'ascii')                                              # (4byte) Format Chunk Marker
    o += (16).to_bytes(4,'little')                                          # (4byte) Length of above format data
    o += (1).to_bytes(2,'little')                                           # (2byte) Format type (1 - PCM)
    o += (channels).to_bytes(2,'little')                                    # (2byte)
    o += (sampleRate).to_bytes(4,'little')                                  # (4byte)
    o += (sampleRate * channels * bitsPerSample // 8).to_bytes(4,'little')  # (4byte)
    o += (channels * bitsPerSample // 8).to_bytes(2,'little')               # (2byte)
    o += (bitsPerSample).to_bytes(2,'little')                               # (2byte)
    o += bytes("data",'ascii')                                              # (4byte) Data Chunk Marker
    o += (datasize).to_bytes(4,'little')                                    # (4byte) Data size in bytes
    return o


@app.route('/')
def home():
    if not session.get('logged_in'):
        return redirect(url_for('do_admin_login'), code=302)
    else:
        # session['key0'] = request.args.get('session')
        return render_template('registrado.html')

    
@app.route('/login', methods=['GET', 'POST'])
def do_admin_login():
    if request.method == 'GET':
        return render_template('login.html')

    if request.method == 'POST':
        if (request.form['psw'] == 'password' and request.form['uname'] == 'admin') or \
           (request.form['psw'] == 'maxi' and request.form['uname'] == 'Maximiliano'):
            session['username'] = request.form['uname']
            session['logged_in'] = True
        else:
            flash('wrong password!')
        return redirect(url_for('home'), code=302)



""" 
    Socket-IO
    The names message, json, connect and disconnect are reserved and cannot be used for named events
"""

@socketio.on('connect')
def test_connect():
    print('Client Connected!')
    dict_data = {"nombre" : session.get('username'), "comentario" : "ultimo", "status" : "1" }
    json_data = '[' + json.dumps(dict_data) + ']'
    print (json_data)
    socketio.emit('tabla', json_data)

    channel = '09'
    if RUNNING_ON_RASP:
        LedBlueToggleContinous('start')
        channel = Memory_to_Channel()

    socketio.emit('boton_canal', {'data': channel})
        



@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

    if RUNNING_ON_RASP:
        LedBlueToggleContinous('stop')



@socketio.on('botones')
def handle_message(message):
    print('received message: ' + str(message))

    # cambiar el canal aca
    if message['data'] == '09' or \
       message['data'] == '12' or \
       message['data'] == '14' or \
       message['data'] == '71' or \
       message['data'] == '72' or \
       message['data'] == '74' or \
       message['data'] == '77' or \
       message['data'] == '81':
        
        phrase = "change channel to " + str(message['data'])
        dict_data = {"nombre" : session.get('username'), "comentario" : phrase, "status" : "1" }
        json_data = '[' + json.dumps(dict_data) + ']'
        print (json_data)
        socketio.emit('tabla', json_data)

        if RUNNING_ON_RASP:
            Channel_to_Memory(message['data'])

    
@socketio.on('ptt')
def transmit(message):
    if message['data'] == 'ON':
        if RUNNING_ON_RASP:
            PttOn()

        print("Cuidado PTT->ON")

    else:
        if RUNNING_ON_RASP:
            PttOff()

        print("PTT->OFF")


################################
# Rutinas de Audio lado Server #
################################
freq = 440
samplerate = 44100
timeloop = 1
amplitude = 1.0
frames_qtty = int(samplerate * timeloop)
# generate audio data
data = np.zeros(frames_qtty, dtype=np.float32)
for i in range(frames_qtty):
    data[i] = np.sin(np.pi * 2 * freq * i / samplerate) * amplitude

data_bytes = data.tobytes()

playing = False
yourThread = threading.Thread()
pckt_cnt = 0


@socketio.on('audio')
def play_or_pause(message):
    global playing
    
    if message['data'] == 'PLAY':
        print("empezar audio por sockets")
        if playing != True:
            playing = True
            print("recording...")
            audio_generation_start()
        
    elif message['data'] == 'STOP':
        print("terminar audio")
        playing = False


def audio_generation_start():
    global yourThread
    global pckt_cnt    
    # Create your thread
    yourThread = threading.Timer(0.05, audio_generation_callback, ())
    yourThread.start()
    pckt_cnt = 0


def audio_generation_callback():
    global playing
    global yourThread
    global pckt_cnt
    global data_bytes
    global timeloop
    
    if playing == True:
        # print (data)
        socketio.emit('audio_rx', {'data': data_bytes})
        # call next loop
        yourThread = threading.Timer(timeloop, audio_generation_callback, ())
        yourThread.start()
        pckt_cnt = pckt_cnt + 1
        print('gen: ' + str(pckt_cnt))


if __name__ == "__main__":
    # app.secret_key = os.urandom(12)
    # app.run(debug=True,host='0.0.0.0', port=5000)    #    app.run(host='0.0.0.0', debug=True, threaded=True)
    socketio.run(app, host='0.0.0.0', debug=True)

