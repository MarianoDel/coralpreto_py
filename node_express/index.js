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
    // res.sendFile('/home/med/Documents/Projects/CoralPetro/node_express/static/login.html');
    res.sendFile(path.join(__dirname + '/static/login.html'));
});

app.post('/login', urlencodedParser, (req, res) => {
    var username = req.body.uname;
    var password = req.body.psw;
    console.log('uname: ' + username + ' psw: ' + password);
    if ((username == 'admin' && password == 'admin') ||
        (username == 'maxi' && password == 'maxi') ||
        (username == 'med' && password == 'med')) {
        // res.send('<h1>Logged IN!</h1>');
        res.redirect('/registrado');
    }
    else {
        res.send('<h1>Please enter correct Username and Password!</h1>');
	res.end();
    }
});

app.get('/registrado', (req, res) => {
    // res.sendFile('/home/med/Documents/Projects/CoralPetro/node_express/static/login.html');
    res.sendFile(path.join(__dirname + '/static/registrado.html'));
});

// Static served files ---------------------------------------------------------
app.use(express.static('./static'));


// Websockets Server ----------------------------------------------------------
// Set up a headless websocket server that prints any events that come in.
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket) => {
    //keep alive msg
    socket.isAlive = true;
    socket.on('pong', heartbeat);
    gpios.LedBlueBlinking_On();
    
    //Rx messages
    socket.on('message', function (message) {
        // console.log(message + ' from: ' + client);
        console.log(message);        
        try {
            var json_msg = JSON.parse(message);

            if (json_msg.botones != undefined)
            {
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
            else if (json_msg.ptt != undefined)
            {
                console.log('ptt: ' + json_msg.ptt);
                if (json_msg.ptt == 'ON')
                    gpios.Ptt_On();
                else
                    gpios.Ptt_Off();
            }
            else if (json_msg.audio != undefined)
            {
                console.log('audio: ' + json_msg.audio);
            }
            
        } catch (error) {
            // console.error(error);
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


// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});


// Audio with naudiodon (using Streams ) ---------------------------------------
// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var ao = new portAudio.AudioIO({
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: -1, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }
});

var rs = fs.createReadStream('../hernandez.wav');

// Start piping data and start streaming
rs.pipe(ao);
ao.start();

// Create an instance of AudioIO with inOptions and outOptions, which will return a DuplexStream
// var ai = new portAudio.AudioIO({
//   inOptions: {
//     channelCount: 1,
//     sampleFormat: portAudio.SampleFormat16Bit,
//     sampleRate: 44100,
//     deviceId: -1 // Use -1 or omit the deviceId to select the default device
//   },
//   outOptions: {
//     channelCount: 2,
//     sampleFormat: portAudio.SampleFormat16Bit,
//     sampleRate: 44100,
//     deviceId: -1 // Use -1 or omit the deviceId to select the default device
//   }
// });

// aio.start();


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

