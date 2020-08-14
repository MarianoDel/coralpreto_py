var _c = console.log;
var d = document;


var txt2 = '[{"nombre": "MED CPANEL"},{"nombre": "MED2 CPANEL"}]';
var tabla_dinamica_cpanel = d.querySelector('#usuarios_cpanel');
function insert2(txt) {
    var tr, td_1, td_2, boton_1;
    var aUsers = JSON.parse(txt);

    for (var i = 0; i < aUsers.length; i++) {
	tr = d.createElement('tr');
	tr.setAttribute('class','user');
	td_1 = d.createElement('td');
	td_2 = d.createElement('td');
	boton_1 = d.createElement('button');
	boton_1.innerHTML = 'DELETE';
	
	boton_1.setAttribute('class','tabla_botones');
	boton_1.setAttribute('data-id',i);
	boton_1.setAttribute('data-name',aUsers[i].nombre);
	boton_1.onclick = SacarUsuario;
	td_2.setAttribute('class','wrap_edit_delete');
	
	td_2.appendChild(boton_1);
	td_1.innerHTML = aUsers[i].nombre;
	
	tr.appendChild(td_1);
	tr.appendChild(td_2);
	
	tabla_dinamica_cpanel.appendChild(tr);
	function SacarUsuario () {
	    d.querySelector('#usuarios_cpanel').removeChild(this.parentNode.parentNode);
	    var id = this.getAttribute('data-id');
            var name = this.getAttribute('data-name');
	    _c(id, name);
	    Remover(id, name);
	}
    }
}

insert2(txt2);


var user_deleted = d.querySelector('.user_deleted');
function ShowMessage (e) {
    if (e==1) {
	user_deleted.innerHTML = '* The user was erased successfully';
	user_deleted.setAttribute('class','already_register green');
    }
    else if (e==2) {
	user_deleted.innerHTML = '';
    }
    else {
	user_deleted.innerHTML = '* Something went wrong!';
	user_deleted.setAttribute('class','already_register red');
    }
}


var already_register = d.querySelector('.already_register');
function CheckUser (e) {
    if (e==1) {
	already_register.innerHTML = '* User registered successfully';
	already_register.setAttribute('class','already_register green');
    } else if (e==2) {
	already_register.innerHTML = '';
    } else {
	already_register.innerHTML = '* The user already exists';
	already_register.setAttribute('class','already_register red');
    }
}

var fx1, fx2, fx3, fx4;

var clock = d.querySelector('#count_down span');
var clock_txt = d.querySelector('#count_down p');
var clock_wrapper = d.querySelector('#count_down');
var no_timmer = d.querySelectorAll('.botones_cpanel');

function myFunctionBoton1 () {
	for (var i = 0; i < no_timmer.length ; i++) {
		no_timmer[i].className += " avoid_clicks";
	}

	clock_wrapper.style.display = 'flex';
	clock_txt.innerHTML = 'Wait for 20 seconds'
	clock.innerHTML = 20;
	fx1 = setInterval(CountDown1, 1000);
	function CountDown1 () {
		clock.innerHTML -= 1;
		if (parseInt(clock.innerHTML) == 0) {
			clock.innerHTML = 'END';
			clearInterval(fx1);
			fx2 = setInterval(Wait, 1000);
		}
	}
    radioPowerCycle();
}

function Wait () {
	for (var i = 0; i < no_timmer.length ; i++) {
		no_timmer[i].className = no_timmer[i].className.replace(" avoid_clicks", "");
	}
	clock_wrapper.style.display = 'none';
	clearInterval(fx2);
}

function myFunctionBoton2 () {
	for (var i = 0; i < no_timmer.length ; i++) {
		no_timmer[i].className += " avoid_clicks";
	}

	clock_wrapper.style.display = 'flex';
	clock_txt.innerHTML = 'Wait 40 seconds for restart and login again'
	clock.innerHTML = 40;
	fx3 = setInterval(CountDown1, 1000);
	function CountDown1 () {
		clock.innerHTML -= 1;
		if (parseInt(clock.innerHTML) == 0) {
			clock.innerHTML = 'END';
			clearInterval(fx3);
			fx4 = setInterval(Redirect, 500);
		}
	}
    serverPowerCycle();
}


function myFunctionBoton3 () {
    serverOpenPort ();
}

function myFunctionBoton4 () {
    serverClosePort ();
}

function Redirect () {
    // window.location.href = "index.html";
    window.location.replace('/login');
}


function insert_wrapper (txt) {

    //limpio tabla
    var filas = d.querySelectorAll("#usuarios_cpanel tr");
    for (i = 0; i < filas.length; i++) {
	filas[i].remove();
    }

    //agrego nuevos
    insert2(txt);
    
}


// Con websocket
var socket;
if (location.protocol !== 'https:') {
    socket = new WebSocket('ws://' + document.domain + ':' + location.port);
} else {
    socket = new WebSocket('wss://' + document.domain + ':' + location.port);
}

socket.onopen = () => {
    var json_msg = JSON.stringify({"ws_open" : "manager"});
    socket.send(json_msg);
}


socket.onmessage = e => {
    if (typeof e.data === "string")
    {
        console.log('Message from server:' + e.data);
        try {
            var json_msg = JSON.parse(event.data);
            if (json_msg.tabla != undefined)
            {
                var a_tabla = json_msg.data;
                var lines = '[';
                a_tabla.forEach(obj => {
                    lines += '{\"nombre\": ' + '\"' + obj + '\"},';
                });

                lines = lines.substring(0, lines.length - 1);
                lines += ']';
                console.log(lines);
                insert_wrapper(lines);                

            }
            else if (json_msg.redirect != undefined)
            {
                console.log("username: " + json_msg.redirect + " not allowed here");
                window.location.replace('/login');
            }
            else if (json_msg.new_user != undefined)
            {
                if (json_msg.new_user == 'inserted ok') {
                    CheckUser (1);
                    setTimeout(() => {
                        CheckUser (2);
                    }, 3000);
                }
                else if (json_msg.new_user == 'not inserted') {
                    CheckUser (0);
                    setTimeout(() => {
                        CheckUser (2);
                    }, 3000);
                }
            }
            else if (json_msg.del_user != undefined)
            {
                if (json_msg.del_user == 'deleted ok') {
                    ShowMessage (1);
                    setTimeout(() => {
                        ShowMessage (2);
                    }, 3000);
                }
                else if (json_msg.del_user == 'not deleted') {
                    ShowMessage (0);
                    setTimeout(() => {
                        ShowMessage (2);
                    }, 3000);
                }
            }
        }
        catch {
        }
    }
}


var btn = d.querySelector('input[value=REGISTER]');
var psw = d.querySelector('input[name=psw]');
var uname = d.querySelector('input[name=uname]');
btn.onclick = function () {
    var uname_txt = uname.value;
    var psw_txt = psw.value;


    var json_data = {
        "username" : uname_txt,
        "password" : psw_txt
    };
    
    var json_pckt = {
        "add_username" : json_data
    };

    var json_msg = JSON.stringify(json_pckt);
    // console.log(json_msg);
    socket.send(json_msg);
    psw.value = "";
    uname.value = "";
    
}




function Remover (pos, nombre) {
    console.log("borrar user: " + nombre);
    var json_pckt = {
        "del_username" : nombre
    };

    var json_msg = JSON.stringify(json_pckt);
    socket.send(json_msg);
}


function radioPowerCycle () {
    var json_pckt = {
        "powercycle" : "RADIO"
    };

    var json_msg = JSON.stringify(json_pckt);
    socket.send(json_msg);
}


function serverPowerCycle () {
    var json_pckt = {
        "powercycle" : "SERVER"
    };

    var json_msg = JSON.stringify(json_pckt);
    socket.send(json_msg);
}


function serverOpenPort () {
    var json_pckt = {
        "server_port" : "OPEN"
    };

    var json_msg = JSON.stringify(json_pckt);
    socket.send(json_msg);
}


function serverClosePort () {
    var json_pckt = {
        "server_port" : "CLOSE"
    };

    var json_msg = JSON.stringify(json_pckt);
    socket.send(json_msg);
}
