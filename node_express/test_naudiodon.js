const portAudio = require('naudiodon');
const fs = require('fs');


// Audio with naudiodon (using Streams ) ---------------------------------------
// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var ao = new portAudio.AudioIO({
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 48000,
      deviceId: -1, // Use -1 or omit the deviceId to select the default device
      highwaterMark: 1024,
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


rs.on('readable', () => {
    let chunk;
    console.log('start the reading');
    for(var i = 0; i <10; i++) {
        chunk = rs.read(1024);
        console.log(`Received ${chunk.length} bytes of data. And seq: ${i}`);
    }
});

// flowing mode con data-event ----------
// rs.on('data', (chunk) => {
//     console.log(`Received ${chunk.length} bytes of data.`);
//     ao.write(chunk);
// });

rs.on('end', () => {
    console.log('no more data');
});

// Start piping data and start streaming
// rs.pipe(ao);
// ao.start();
