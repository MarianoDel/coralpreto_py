const portAudio = require('naudiodon');

const running_on_slackware = true;
const running_on_raspbian = !running_on_slackware;

const stop_in_secs = 10;    //or 0 if is continuous

// Chequeo los dispositivos disponibles ----------------------------------------
console.log(portAudio.getDevices());

// Audio with naudiodon (using Streams ) ---------------------------------------
// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var audio_options;
if (running_on_slackware) {
    console.log('\nRunning on Slackware!!!\n');
    audio_options = {
        outOptions: {
            // channelCount: 2,
            channelCount: 1,
            sampleFormat: portAudio.SampleFormat16Bit,
            // sampleFormat: portAudio.SampleFormat8Bit,
            sampleRate: 44100,
            deviceId: -1, // Use -1 or omit the deviceId to select the default device
            // highwaterMark: 1024,
            closeOnError: false // Close the stream on error or just log it
        }
    }
} else {
    console.log('\nRunning on Raspbian!!!\n');
    audio_options = {
        outOptions: {
            // channelCount: 2,
            channelCount: 1,
            sampleFormat: portAudio.SampleFormat16Bit,
            // sampleFormat: portAudio.SampleFormat8Bit,
            sampleRate: 44100,
            deviceId: 0, // Use -1 or omit the deviceId to select the default device
            // highwaterMark: 1024,
            closeOnError: false // Close the stream on error or just log it
        }
    }    
}

var ao = new portAudio.AudioIO(audio_options);


// create a sine wave lookup table ---------------------------------------------
const chunk_time_ms = 1000;
const sampleRate = 44100;
const size = chunk_time_ms * sampleRate / 1000;
var pck_cnt = 0;
var buffer = new Int16Array(size);
// var buffer = new Buffer(size);
const freq = 400;
const amplitude = 32767;
console.log('buffer length: ' + buffer.length);
for (var i = 0; i < buffer.length; i++) {
    buffer[i] = amplitude * Math.sin(6.28 * freq * i / sampleRate);
}

console.log('check for chunks cuts [0]: ' + buffer[0] +
            ' [1]: ' + buffer[1] +
            ' [' + (buffer.length - 2) + ']: ' + buffer[(buffer.length - 2)] +
            ' [' + (buffer.length - 1) + ']: ' + buffer[(buffer.length - 1)]);
var buffer_new = Buffer.from(buffer.buffer);


// Interval to send audio samples to the device --------------------------------
let timerId = setInterval(() => {
    ao.write(buffer_new);
    console.log(`buffer_new length: ${buffer_new.length} pck_cnt: ${pck_cnt}`);
    pck_cnt++;
    
}, (chunk_time_ms - 20));


if (stop_in_secs) {
    setTimeout(() => {
        clearTimeout(timerId);
        console.log('test ended');
    }, stop_in_secs * 1000);
}

ao.start();

