const portAudio = require('naudiodon');
const fs = require('fs');


// Audio with naudiodon (using Streams ) ---------------------------------------
// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var ao = new portAudio.AudioIO({
  outOptions: {
      // channelCount: 2,
      channelCount: 1,
      sampleFormat: portAudio.SampleFormat16Bit,
      // sampleFormat: portAudio.SampleFormat8Bit,
    sampleRate: 44100,
      deviceId: -1, // Use -1 or omit the deviceId to select the default device
      // highwaterMark: 1024,
    closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error
  }
});

// var rs = fs.createReadStream('../hernandez.wav');
// var rs = fs.createReadStream('../2minutos.wav');
var rs = fs.createReadStream('../ZAZ.wav');

// paused mode con stream-read ----------
// rs.on('readable', () => {
//   let chunk;
//   while (null !== (chunk = rs.read(1024))) {
//     console.log(`Received ${chunk.length} bytes of data.`);
//   }
// });

// var end_the_reading = 0;
// rs.on('readable', () => {
//     let chunk;
//     if (!end_the_reading) {
//         console.log('start the reading, readable flowing mode: ' + rs.readableFlowing);    
//         for(var i = 0; i <10; i++) {
//             chunk = rs.read(1024);
//             console.log(`Received ${chunk.length} bytes of data. And seq: ${i}`);
//         }
//         end_the_reading = 1;
//     }
//     console.log('readable called, end_the_reading: ' + end_the_reading);    
// });

// paused mode -----------------------------------------------------------------
// ao.write(rs.read(1024), function cbw () => {
//     console.log('cbw 1024');    
// });
// rs.on("data",chunk=>ao.write(chunk));    //esto termina de leer rapido y deja todo en el buffer

// with timed interval ---------------------------------------------------------
// repeat with the interval of 500 mseconds
const chunk_time_ms = 1000;
const sampleRate = 44100;
const size = chunk_time_ms * sampleRate * 2/ 1000;
var pck_cnt = 0;
console.log('chunk size: ' + size);

// let timerId = setInterval(() => {
//     let chunk = rs.read(size);
//     ao.write(chunk);
//     console.log(`Received ${chunk.length} bytes of data. pck_cnt: ${pck_cnt}`);
//     pck_cnt++;
    
// }, chunk_time_ms);

// create a sine wave lookup table
var buffer = new Int16Array(size);
// var buffer = new Buffer(size);
const freq = 400;
const amplitude = 32767;
console.log('buffer length: ' + buffer.length);
for (var i = 0; i < buffer.length; i++) {
    buffer[i] = amplitude * Math.sin(6.28 * freq * i / sampleRate);
    // buffer[i] = (Math.sin((i / sampleRate) * 6.28 * freq) * 127) + 127;

}

var buffer_new = Buffer.from(buffer.buffer);

let timerId = setInterval(() => {
    ao.write(buffer_new);
    console.log(`buffer_new length: ${buffer_new.length} pck_cnt: ${pck_cnt}`);
    pck_cnt++;
    
}, chunk_time_ms);

// flowing mode con data-event ----------
// rs.on('data', (chunk) => {
//     console.log(`Received ${chunk.length} bytes of data.`);
//     ao.write(chunk);
// });

rs.on('end', () => {
    console.log('no more data');
    clearTimeout(timerId);
});

// Start piping data and start streaming
// rs.pipe(ao);
ao.start();
