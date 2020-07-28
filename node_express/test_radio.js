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

// ao.start();


async function powerUpCycle () {
    await gpios.OnOff_Off();
    await delay(5000);
    await gpios.OnOff_On();
    await delay(15000);
    await console.log('radio must be ready now!');
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function test2Cycles () {
    await powerUpCycle();
    await console.log('first cycle');
    await ao.start();
    await gpios.Ptt_On();
    await delay(5000);
    await gpios.Ptt_Off();
    await console.log('first cycle resting');
    await delay(5000);
    await console.log('second cycle');
    await gpios.Ptt_On();
    await delay(5000);
    await gpios.Ptt_Off();
    await console.log('second cycle resting');
    await delay(5000);
    await ao.quit();
    await delay(1000);
    process.exit();
}

////////////////
// Main Tests //
////////////////
console.log('TEST RADIO 2 PTT of 5 secs');
InitialValues();
// powerUpCycle();
test2Cycles();

