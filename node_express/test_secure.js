const express = require('express');
const http = require('http');
const https = require('https');
const ws = require('ws');
const fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
const members = require('./members');
const sku = require('./socket_utils');

const app = express();

const secure_hostname = '192.168.0.16';
const secure_port = 3443;

var privateKey  = fs.readFileSync('./self_signed_cert/server.key');
var certificate = fs.readFileSync('./self_signed_cert/server.cert')
var credentials = {key: privateKey, cert: certificate};


// Middleware ------------------------------------------------------------------
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.all('*', ensureSecure); // at top of routing calls

function ensureSecure(req, res, next){
    if ((req.secure) && (req.hostname == secure_hostname)) {
        // req is secure and to proper hostname
        // console.log('ensure secure: ' + req.secure + ' to host: ' + req.hostname);
        return next();
    };
    // handle port numbers if you need non defaults
    // let redirect = 'https://' + req.hostname + ':' + secure_port + req.url;
    let redirect = 'https://' + secure_hostname + ':' + secure_port + req.url;    
    console.log('redirected to: ' + redirect);
    res.redirect(redirect); // express 4.x
}


// Routes ----------------------------------------------------------------------
app.get('/', (req, res) => {
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/login.html'));
});


var mySocketsBkp = new Set();
var myClientArray = [];
var last_username = "";
app.post(['/login', '/login.html'], urlencodedParser, (req, res) => {
    var username = req.body.uname;
    var password = req.body.psw;

    if (members.checkUserPass(username, password)) {
        res.redirect('/registrado');
        last_username = username;
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


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
const secure_server = httpsServer.listen(3443);

// Websockets Server ----------------------------------------------------------
// Set up a headless websocket server that prints any events that come in.
const wsServer = new ws.Server({ noServer: true });
// const wsServer = new ws.Server(httpsServer);
wsServer.on('connection', (socket, req) => {
    //keep alive msg
    socket.isAlive = true;
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
        }
        else if (typeof message === "string")
        {
            console.log('msg: ' + message + ' msg len: ' + message.length);
            let socket_index = sku.getSocketIndex(socket, wsServer.clients);
            let uname = myClientArray[socket_index].client;

            try {
                var json_msg = JSON.parse(message);

                if (json_msg.botones != undefined) {
                    console.log('user: ' + uname + ' botones: ' + json_msg.botones);

                    var json_res = JSON.stringify({"boton_canal" : json_msg.botones});
                    // console.log('sended: ' + json_res);
                    // socketSendBroadcast(json_res);
                    sku.socketSendBroadcastNoSelf(json_res, socket, wsServer.clients);

                    //Tx messages
                    var json_entry = {
                        "nombre":uname,
                        "comentario":"changed to channel " + json_msg.botones,
                        "status":"1"
                    };

                    json_res = {
                        "tabla" : "undef",
                        "data": tableAdd(json_entry)
                    };
                    
                    // console.log(json_res);
                    // socket.send(JSON.stringify(json_res));
                    sku.socketSendBroadcast(JSON.stringify(json_res), wsServer.clients);
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
                    console.log('user: ' + uname + ' ptt: ' + json_msg.ptt);
                    if (json_msg.ptt == 'ON')
                        console.log('probably ptt to ON');
                    else
                        console.log('probably ptt to OFF');
                }
                else if (json_msg.audio != undefined) {
                    console.log('user: ' + uname + ' audio: ' + json_msg.audio);
                    if (json_msg.audio == 'PLAY') {
                        console.log('probably audio to ON');
                        myClientArray[socket_index].listen = true;
                    }
                    else {
                        console.log('probably audio to OFF');
                        myClientArray[socket_index].listen = false;
                    }
                }
                else if (json_msg.ws_open != undefined) {
                    console.log('user: ' + uname + ' ws_open: ' + json_msg.ws_open);
                    //Tx message
                    var json_res = JSON.stringify({"boton_canal" : "81"});
                    console.log('sended: ' + json_res);
                    // socketSendBroadcast(json_res);
                    socket.send((json_res));

                    //Tx messages
                    var json_entry = {
                        "nombre":uname,
                        "comentario":"now connected",
                        "status":"1"
                    };

                    json_res = {
                        "tabla" : "undef",
                        "data": tableAdd(json_entry)
                    };
                    
                    // console.log(json_res);
                    // socket.send(JSON.stringify(json_res));
                    sku.socketSendBroadcast(JSON.stringify(json_res), wsServer.clients);
                    
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

        //busco la posicion del set, quito ese cliente
        let lost = sku.getSocketLostIndex(wsServer.clients, mySocketsBkp, myClientArray);
    });
});



secure_server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        // console.log('clients: ');
        let qtty = wsServer.clients.size;
        var client_num = 0;
        var client_new = 0;
        wsServer.clients.forEach(element => {
            console.log('clients qtty: ' + qtty + ' cliente: ' + client_num);
            if (socket == element) {
                client_new = client_num;
                console.log('client match on: ' + client_new + ' last uname was: ' + last_username);
            }
            client_num++;
        });
        myClientArray[client_new] = {
            client: last_username,
            listen: false
        }
        last_username = "";

        //cada vez que tengo nueva conexion hago un bkp del set de ws
        sku.copySets(mySocketsBkp, wsServer.clients);
        wsServer.emit('connection', socket, request);
    });
});


// Table logger --------------------------------------------------------------
var table_json = [];

function tableAdd (json_msg) {
    let length = table_json.unshift(json_msg);
    if (length > 4)
        table_json.splice(4, length - 4);

    return table_json;
}



