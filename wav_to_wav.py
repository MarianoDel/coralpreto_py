# -*- coding: utf-8 -*-
#usar python3
import wave


# Archivo original
wf = wave.open("2minutos.wav", 'rb')
CHANNELS = wf.getnchannels()
RATE = wf.getframerate()
BITSPERSAMPLE = wf.getsampwidth() * 8
DATAL = wf.getnframes()
print (f"wf chnls: {CHANNELS} rate: {RATE} sampwidth: {BITSPERSAMPLE} datasize: {DATAL}")


# Archivo de salida
out_file = "output_w.wav"
out_frames = []  # Initialize array to store frames


def genHeader(sampleRate, bitsPerSample, channels, samples):
    datasize = samples * channels * bitsPerSample // 8
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


# read data
CHUNK = 1024
data = wf.readframes(CHUNK)

while len(data) > 0:
    out_frames.append(data)
    data = wf.readframes(CHUNK)

wf.close()
print('Finish copy')

with open(out_file, 'wb') as outf:
    wav_header = genHeader(RATE, BITSPERSAMPLE, CHANNELS, DATAL)
    outf.write(wav_header)
    outf.write(b''.join(out_frames))
    outf.close()

print('Close file')
