from flask import Flask, Response, render_template, request, flash
import pyaudio
import os

app = Flask(__name__)    #toma el nombre del archivo que corre

FORMAT = pyaudio.paInt16
CHANNELS = 2
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 5

audio1 = pyaudio.PyAudio()

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
def index():
    return render_template('index.html')    #ubicar en carpeta template


@app.route('/audio')
def audio():
    # start Recording
    def sound():

        CHUNK = 1024
        sampleRate = 44100
        bitsPerSample = 16
        channels = 2
        wav_header = genHeader(sampleRate, bitsPerSample, channels)

        stream = audio1.open(format=FORMAT,
                             channels=CHANNELS,
                             rate=RATE,
                             input=True,
                             frames_per_buffer=CHUNK)
        
        print("recording...")
        #frames = []

        while True:
            data = wav_header+stream.read(CHUNK)
            yield(data)

    return Response(sound())


@app.route('/login', methods=['GET', 'POST'])
def do_admin_login():
    if request.method == 'GET':
        return render_template("login.html")
    
    if request.form['password'] == 'password' and request.form['username'] == 'admin':
        # session['logged_in'] = True
        flash('password OK!')
    else:
        flash('wrong password!')

    return index()


if __name__ == "__main__":
    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', debug=True)    #lo corro en modo debug para conocer errores

    
