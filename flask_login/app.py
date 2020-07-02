from flask import Flask
from flask import Flask, flash, redirect, render_template, request, session, abort, Response, url_for
from flask_socketio import SocketIO
import json
import pyaudio
import os

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



@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


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


        
    

# CADA VEZ QUE ACTIVAN EL CONTROL DEBO ABRIR EL MIC
# ESTO LO PUEDO VER CON RECORDING...
@app.route('/audio')
def audio():
    # start Recording
    print("recording...")

    audio_stream = audio_dev.open(format=FORMAT,
                              channels=CHANNELS,
                              rate=RATE,
                              frames_per_buffer=CHUNK,
                              input=True)

    def AudioInnerLoop():
        """Audio streaming generator function."""
        wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS)
        send_header = True

        while True:
            currChunk = audio_stream.read(CHUNK, exception_on_overflow=True)

            if send_header:
                data_to_stream = wav_header + currChunk
                send_header = False
            else:
                data_to_stream = currChunk

            yield data_to_stream

    # return Response(GetNewDataStream(), mimetype='audio/x-wav')
    return Response(AudioInnerLoop(), mimetype='audio/x-wav')


if __name__ == "__main__":
    # app.secret_key = os.urandom(12)
    # app.run(debug=True,host='0.0.0.0', port=5000)    #    app.run(host='0.0.0.0', debug=True, threaded=True)
    socketio.run(app, host='0.0.0.0', debug=True)

