const portAudio = require('naudiodon');

const running_on_slackware = true;
const running_on_raspbian = !running_on_slackware;

const stop_in_secs = 10;    //or 0 if is continuous

// Chequeo los dispositivos disponibles ----------------------------------------
console.log(portAudio.getDevices());

// Audio with naudiodon (using Streams ) ---------------------------------------
// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var audio_in_options;
var audio_out_options;
if (running_on_slackware) {
    console.log('\nRunning on Slackware!!!\n');
    audio_in_options = {
        inOptions: {
            channelCount: 1,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 44100,
            highwaterMark: 88200,    //un paquete completo antes de cortar
            deviceId: -1, // Use -1 or omit the deviceId to select the default device
            closeOnError: false // Close the stream on error or just log it
        }
    }

    audio_out_options = {
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
    audio_in_options = {
        inOptions: {
            channelCount: 1,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 44100,
            highwaterMark: 88200,    //un paquete completo antes de cortar
            deviceId: 0, // Use -1 or omit the deviceId to select the default device
            closeOnError: false // Close the stream on error or just log it
        }
    }

    audio_out_options = {
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

var ai = new portAudio.AudioIO(audio_in_options);
var ao = new portAudio.AudioIO(audio_out_options);

// flowing mode asociando al evento data ---------------------------------------
ai.on('data', onDataCallback);

var pck_cnt = 0;
var start_ao = false;
function onDataCallback (buffer) {
    if (!start_ao) {
        ao.start();
        start_ao = true;
    }
        
    ao.write(buffer);
    console.log('pkt: ' + pck_cnt + ' size: ' + buffer.length + ' t: ' + buffer.timestamp);
    pck_cnt++;
};

ai.start();

