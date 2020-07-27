const portAudio = require('naudiodon');
const gpios = require('./gpios');

const running_on_slackware = true;
const running_on_raspbian = !running_on_slackware;

gpios.GpiosInit();

function InitialValues () {
    gpios.LedBlueOff();
    gpios.OnOff_Off();
    gpios.Ptt_Off();
    gpios.Bit0_Off();
    gpios.Bit1_Off();
    gpios.Bit2_Off();    
}

function TestCycle () {
    gpios.OnOff_Cycle_On();
}


const freq = 400;
const amplitude = 32767;
function create_buffer_int16 (samples, frequency, sampleRate) {
    var buf = new Int16Array(samples);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = amplitude * Math.sin(6.28 * frequency * i / sampleRate);
    }

    console.log('check for chunks cuts [0]: ' + buf[0] +
                ' [1]: ' + buf[1] +
                ' [' + (buf.length - 2) + ']: ' + buf[(buf.length - 2)] +
                ' [' + (buf.length - 1) + ']: ' + buf[(buf.length - 1)]);
    
    return Buffer.from(buf.buffer);
}

var audio_out_options;
if (running_on_slackware) {
    console.log('\nRunning on Slackware!!!\n');

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

    audio_out_options = {
        outOptions: {
            // channelCount: 2,
            channelCount: 1,
            sampleFormat: portAudio.SampleFormat16Bit,
            // sampleFormat: portAudio.SampleFormat8Bit,
            sampleRate: 44100,
            deviceId: 0, // Use -1 or omit the deviceId to select the default device
            highwaterMark: 32768,
            closeOnError: false // Close the stream on error or just log it
        }
    }
}

var ao = new portAudio.AudioIO(audio_out_options);

const buffer_harcoded = create_buffer_int16(44100, 400, 44100);

// Interval to send audio samples to the device --------------------------------
var chunk_time_ms = 1000;
var pck_cnt = 0;
let timerId = setInterval(() => {
    ao.write(buffer_harcoded);
    console.log(`buffer length: ${buffer_harcoded.length} pck_cnt: ${pck_cnt}`);
    pck_cnt++;
    
}, (chunk_time_ms - 10));

ao.start();


function TestModulation () {
    (async () => {
        await gpios.Ptt_On();
        await setTimeout(() => {
            gpios.Ptt_Off();
            console.log('ptt and modulation finished');
        }, 5000);
        await setTimeout(() => {
            console.log('cycle in off');
        }, 20000);

    })();
}
////////////////
// Main Tests //
////////////////
console.log('TEST RADIO 2 PTT of 5 secs');
InitialValues();

// (async () => {    
//     await console.log('cycling power on radio');
//     await TestCycle();
//     await setTimeout(() => {
//         console.log('change freq channel');
//         }, 20000);
//     await gpios.ChannelToGpios('12');
//     await TestModulation();
//     await TestModulation();
// })();
TestModulation();

