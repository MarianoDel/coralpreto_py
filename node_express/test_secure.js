const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
const members = require('./members');

const app = express();

const secure_port = 3443;

var privateKey  = fs.readFileSync('./self_signed_cert/server.key');
var certificate = fs.readFileSync('./self_signed_cert/server.cert')
var credentials = {key: privateKey, cert: certificate};


// Middleware ------------------------------------------------------------------
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.all('*', ensureSecure); // at top of routing calls

function ensureSecure(req, res, next){
    if(req.secure){
        // OK, continue
        return next();
    };
    // handle port numbers if you need non defaults
    let redirect = 'https://' + req.hostname + ':' + secure_port + req.url;
    console.log(redirect);
    res.redirect(redirect); // express 4.x
}


// Routes ----------------------------------------------------------------------
app.get('/', (req, res) => {
    res.redirect('/login');
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/login.html'));
});


app.post(['/login', '/login.html'], urlencodedParser, (req, res) => {
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


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(3443);
