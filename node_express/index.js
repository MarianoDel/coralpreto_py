const express = require('express');
const ws = require('ws');
const members = require('./members');
const gpios = require('./gpios');
var bodyParser = require('body-parser');
var path = require('path');
const portAudio = require('naudiodon');
const fs = require('fs');

const app = express();
const port = 3000;

const running_on_slackware = true;
const running_on_raspbian = !running_on_slackware;
// Middleware functions --------------------------------------------------------
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

// Routes ----------------------------------------------------------------------
app.get('/', (req, res) => {
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/login.html'));
});

app.post(['/login', 'login.html'], urlencodedParser, (req, res) => {
    var username = req.body.uname;
    var password = req.body.psw;

    if (members.checkUserPass(username, password)) {
        res.redirect('/registrado');
    }
    else {
        res.redirect('/no_login');
    }
});


app.get('/registrado', (req, res) => {
    // res.sendFile('/home/med/Documents/Projects/CoralPetro/node_express/static/login.html');
    res.sendFile(path.join(__dirname + '/static/registrado.html'));
});


app.get('/no_login', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/no-login.html'));
});

// Static served files ---------------------------------------------------------
app.use(express.static('./static'));


// Websockets Server ----------------------------------------------------------
// Set up a headless websocket server that prints any events that come in.
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket, req) => {
    //keep alive msg
    socket.isAlive = true;
    socket.on('pong', heartbeat);
    gpios.LedBlueBlinking_On();
    socket.binaryType = "arraybuffer";
    
    //Rx messages
    socket.on('message', function (message) {
        // console.log(message + ' from: ' + Object.getOwnPropertyNames(client));
        // console.log(message);
        console.log('typeof message: ' + typeof message);

        if (message instanceof ArrayBuffer)
        {
            var size = message.byteLength;
            console.log('array or blob size: ' + size);
            const buffer = Buffer.from(message);
            onRxSamples(buffer);
        }
        else if (typeof message === "string")
        {
            console.log('msg: ' + message + ' msg len: ' + message.length);

            try {
                var json_msg = JSON.parse(message);

                if (json_msg.botones != undefined) {
                    console.log('botones: ' + json_msg.botones);
                    gpios.ChannelToGpios(json_msg.botones);

                    //Tx messages
                    var json_res = {
                        "tabla" : "undef",
                        "nombre": "MED",
                        "comentario":"changed to channel " + json_msg.botones,
                        "status":"1" };
                    
                    // json_msg = "server msg";
                    socket.send(JSON.stringify(json_res));
                    // socket.send(json_msg);
                    //prueba envio binario
                    // var bin = new Float32Array(5);
                    // bin[0] = 55.5;
                    // bin[1] = 55.5;
                    // bin[2] = 55.5;
                    // bin[3] = 55.5;
                    // bin[4] = 55.5;
                    // socket.send(bin);
                }
                else if (json_msg.ptt != undefined) {
                    console.log('ptt: ' + json_msg.ptt);
                    if (json_msg.ptt == 'ON')
                        gpios.Ptt_On();
                    else
                        gpios.Ptt_Off();
                }
                else if (json_msg.audio != undefined) {
                    console.log('audio: ' + json_msg.audio);
                    if (json_msg.audio == 'PLAY') {
                        start_sending_audio();
                        // start_sending_harcoded_audio();
                    }
                    else {
                        stop_sending_audio();
                        // stop_sending_harcoded_audio();
                    }
                }
                else if (json_msg.ws_open != undefined) {
                    //Tx message
                    var json_res = JSON.stringify({"boton_canal" : gpios.GpiosToChannel()});
                    console.log('sended: ' + json_res);
                    socket.send((json_res));
                }
                else {
                    console.log('no handler for this data');
                }
                
            } catch (error) {
                console.error(error);
            }
        }
        
        // var obj = JSON.parse(message);
        // var msg = obj.botones;
        
    });

    socket.on('close', () => {
        console.log('disconnect client close');
        // clearInterval(interval);
        gpios.LedBlueBlinking_Off();
    });
    
});


// Initialize Gpios module -----------------------------------------------------
gpios.GpiosInit();
gpios.LedBlueOff();
gpios.OnOff_Off();
gpios.Ptt_Off();
gpios.Bit0_Off();
gpios.Bit1_Off();
gpios.Bit2_Off();    

//prender radio
// gpios.OnOff_On();
gpios.OnOff_Cycle_On();

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        // console.log('clients: ');
        var client_num = 1;
        wsServer.clients.forEach(element => {
            console.log('cliente: ' + client_num);
            console.log(element);
            client_num++;
        });
        wsServer.emit('connection', socket, request);
    });
});

// Timed harcoded signal data by websockets ------------------------------------
var buffer_new = create_buffer_int16(44100, 400, 44100);
var chunk_time_ms = 1000;
var pck_cnt = 0;

var timed_pck;
function start_sending_harcoded_audio () {
    // Harcoded Audio by timeout
    timed_pck = setInterval(() => {
        wsServer.clients.forEach(function each(client) {
            if (client.readyState === ws.OPEN) {
                client.send(buffer_new);
                console.log('pkt: ' + pck_cnt + ' server: ' + client.url + ' binary: ' + client.binaryType);
            }
        });
        pck_cnt++;
        
    }, (chunk_time_ms - 20));
    // End of Harcoded Audio by timeout
}


function stop_sending_harcoded_audio () {
    // Harcoded Audio by timeout
    console.log('clearing timed interval');
    if (timed_pck.hasRef())
        clearInterval(timed_pck);
    // End of Harcoded Audio by timeout
}


var single_client_play = false;
function start_sending_audio () {
    single_client_play = true;
}

function stop_sending_audio () {
    single_client_play = false;
}

// Timed harcoded signal data --------------------------------------------------
// var harcodedbuffer = new Int16Array(size);
// var buffer = new Buffer(size);
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

// console.log('buffer length: ' + buffer.length);
// for (var i = 0; i < buffer.length; i++) {
//     buffer[i] = amplitude * Math.sin(6.28 * freq * i / sampleRate);
//     // buffer[i] = (Math.sin((i / sampleRate) * 6.28 * freq) * 127) + 127;

// }

// console.log('check for chunks cuts [0]: ' + buffer[0] +
//             ' [1]: ' + buffer[1] +
//             ' [' + (buffer.length - 2) + ']: ' + buffer[(buffer.length - 2)] +
//             ' [' + (buffer.length - 1) + ']: ' + buffer[(buffer.length - 1)]);
// var buffer_new = Buffer.from(buffer.buffer);
// var buffer_new = create_buffer_int16(44100, 400, 44100);
// var chunk_time_ms = 1000;
// var pck_cnt = 0;
// let timerId = setInterval(() => {
//     ao.write(buffer_new);
//     console.log(`buffer_new length: ${buffer_new.length} pck_cnt: ${pck_cnt}`);
//     pck_cnt++;
    
// }, (chunk_time_ms - 20));

// Audio with naudiodon (using events) -----------------------------------------
// Create an instance of AudioIO with inOptions (defaults are as below), which will return a ReadableStream
// function create_ai_input (ai_input) {
//     ai_input = new portAudio.AudioIO({
//         inOptions: {
//             channelCount: 1,
//             sampleFormat: portAudio.SampleFormat16Bit,
//             sampleRate: 44100,
//             highwaterMark: 88200,    //un paquete completo antes de cortar
//             deviceId: -1, // Use -1 or omit the deviceId to select the default device
//             closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error        
//         }
//     });

//     return ai_input;
// }

// var ai_not_first_time = false;
// var ai;
// ai = create_ai_input(ai);

// Solo audio input ------------------------------------------------------------
// var ai = new portAudio.AudioIO({
//     inOptions: {
//         channelCount: 1,
//         sampleFormat: portAudio.SampleFormat16Bit,
//         sampleRate: 44100,
//         highwaterMark: 88200,    //un paquete completo antes de cortar
//         deviceId: -1, // Use -1 or omit the deviceId to select the default device
//         closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error        
//     }
// });

// ai.on('data', onDataCallback);

// function onDataCallback (buffer) {
//     wsServer.clients.forEach(function each(client) {
//         if (client.readyState === ws.OPEN) {
//             if (single_client_play)
//             {
//                 client.send(buffer);
//                 console.log('pkt: ' + pck_cnt + ' size: ' + buffer.length);
//             }
//             else
//                 console.log('flushed portaudio size: ' + buffer.length);
//         }
//     });
//     pck_cnt++;
// };

// ai.start();

// Audio input & output --------------------------------------------------------
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
            highwaterMark: 32768,
            closeOnError: false // Close the stream on error or just log it
        }
    }
}

var ai = new portAudio.AudioIO(audio_in_options);
var ao = new portAudio.AudioIO(audio_out_options);

// flowing mode asociando al evento data ---------------------------------------
ai.on('data', onDataCallback);

var pck_cnt = 0;
function onDataCallback (buffer) {
    wsServer.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
            if (single_client_play)
            {
                client.send(buffer);
                console.log('pkt: ' + pck_cnt + ' size: ' + buffer.length  + ' t: ' + buffer.timestamp);
            }
            else
                console.log('flushed portaudio size: ' + buffer.length);
        }
    });
    pck_cnt++;
};

var start_ao = false;
const buffer_harcoded = create_buffer_int16(16378, 400, 44100);
function onRxSamples (buffer) {
    if (!start_ao) {
        ao.start();
        start_ao = true;
    }
    
    if (ao) {
        ao.write(buffer_harcoded);
        // ao.write(buffer);
    }
}

ai.start();


// Check for ws connections still alive ----------------------------------------
function noop() {}

function heartbeat() {
    this.isAlive = true;
    console.log('keepalive');
}

const interval = setInterval(function ping() {
    console.log('interval');
    wsServer.clients.forEach(function each(socket) {
        if (socket.isAlive === false)
        {
            console.log('no comms disconnect');
            return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping(noop);
    });
}, 10000);


// catch exit signal -----------------------------------------------------------
process.on('SIGINT', function() {
    console.log("Caught interrupt signal, closing");
    gpios.OnOff_Off();
    gpios.LedBlueOff();
    gpios.Ptt_Off();
    gpios.Bit0_Off();
    gpios.Bit1_Off();
    gpios.Bit2_Off();    

    process.exit();
});
