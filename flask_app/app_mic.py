from flask import Flask, Response, render_template
import pyaudio

app = Flask(__name__)    #toma el nombre del archivo que corre

FORMAT = pyaudio.paInt16
CHANNELS = 2
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
def index():
    return render_template('index.html')    #ubicar en carpeta template


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
        while True:
            currChunk = audio_stream.read(CHUNK)
            wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS)
            data_to_stream = wav_header + currChunk
            yield data_to_stream
        
    # return Response(GetNewDataStream(), mimetype='audio/x-wav')
    return Response(AudioInnerLoop())


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)    #lo corro en modo debug para conocer errores

    
