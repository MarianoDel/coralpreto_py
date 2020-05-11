from flask import Flask, Response, render_template
# import pyaudio
import wave
import socket

""" Me comunico con el server TCP localhost:30000 de pyaudio_server2.py """
""" Uso wave solo para conocer parametros del archivo wav """

app = Flask(__name__)    #toma el nombre del archivo que corre


wf = wave.open("../2minutos.wav", 'rb')
CHANNELS = wf.getnchannels()
RATE = wf.getframerate()
CHUNK = 1024
BITSPERSAMPLE = wf.getsampwidth() * 8
DATAL = wf.getnframes()
print (f"wf chnls: {CHANNELS} rate: {RATE} sampwidth: {BITSPERSAMPLE} datasize: {DATAL}")

# socket connection with server
host = '127.0.0.1'
port = 30000
  
s = socket.socket(socket.AF_INET,socket.SOCK_STREAM) 
s.connect((host,port)) 


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


# Esta funcion responde por red sin ruido
# con archivo original y con archivo copiado con wav_to_wav.py
# @app.route("/audio")
# def audio():
#     def generate():
#         # with open("../2minutos.wav", "rb") as fwav:
#         with open("../output_w.wav", "rb") as fwav:            
#             data = fwav.read(1024)
#             while data:
#                 yield data
#                 data = fwav.read(1024)
#     return Response(generate(), mimetype="audio/x-wav")
#     # return Response(generate())


# CADA VEZ QUE ACTIVAN EL CONTROL DEBO ABRIR EL MIC
# ESTO LO PUEDO VER CON RECORDING...
@app.route('/audio')
def audio():
    # start Recording
    print("streaming...")
    
    def AudioInnerLoop():
        """Audio streaming generator function."""
        # wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS, DATAL)
        wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS)
        # wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS, 200000)
        send_header = True
        
        while True:
            s.send(b"KEEP ALIVE")
            currChunk = s.recv(CHUNK)
            if len(currChunk) == 0:
                print ("socket closed?")

            if send_header:
                data_to_stream = wav_header + currChunk
                send_header = False
            else:
                data_to_stream = currChunk

            yield data_to_stream
        
    # return Response(GetNewDataStream(), mimetype='audio/x-wav')
    # return Response(AudioInnerLoop())
    return Response(AudioInnerLoop(), mimetype='audio/x-wav')




if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)    #lo corro en modo debug para conocer errores

    
