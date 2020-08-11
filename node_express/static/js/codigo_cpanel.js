// INSERCIÓN DE USERS EN CPANEL

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
	    _c(id);
	    Remover(id);
	}
    }
}

insert2(txt2);

function Remover (pos) {
	var aUsers = JSON.parse(txt2);
	aUsers.splice(pos,1);
	_c(aUsers);
	var myJSON = JSON.stringify(aUsers);
	txt2 = myJSON;
	// insert2(txt2);
}

var fx1, fx2, fx3, fx4;

var clock = d.querySelector('#count_down span');
var clock_txt = d.querySelector('#count_down p');
var clock_wrapper = d.querySelector('#count_down');

function myFunctionBoton1 () {
	clock_wrapper.style.display = 'flex';
	clock_txt.innerHTML = 'Aguanta los 20 seg PUTITO'
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
}

function Wait () {
	clock_wrapper.style.display = 'none';
	clearInterval(fx2);
}

function myFunctionBoton2 () {
	clock_wrapper.style.display = 'flex';
	clock_txt.innerHTML = 'Aguanta los 40 seg PUTITO y despues te mando al login'
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
}


function myFunctionBoton3 () {
    let txt3 = '[{"nombre": "med"},{"nombre": "masi"}]';
    console.log(txt3);
    insert_wrapper(txt3);
}

function Redirect () {
	window.location.href = "index.html";
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
                // var texto = '[{"nombre": "maci"},{"nombre": "maci"},{"nombre": "maci"},{"nombre": "maci"}]';
                // console.log(texto);
                // insert_wrapper(texto);

            }
            else if (json_msg.redirect != undefined)
            {
                console.log("username: " + json_msg.redirect + " not allowed here");
                window.location.replace('/login');
            }

            
            // else if (json_msg.boton_canal != undefined)
            // {
            //     console.log("boton_canal: " + json_msg.boton_canal);
            //     cambiaBoton(json_msg.boton_canal);
            //     // cambiaBoton('72');                
            // }
            // else if (json_msg.show_uname != undefined)
            // {
            //     console.log("username: " + json_msg.show_uname);
            //     insertUser(json_msg.show_uname);
            // }
            // else if (json_msg.redirect != undefined)
            // {
            //     console.log("username: " + json_msg.redirect + " not allowed here");
            //     window.location.replace('/login');
            // }
        }
        catch {
        }
    }
}


var btn = d.querySelector('input[value=REGISTER]');
var psw = d.querySelector('input[name=psw]');
var uname = d.querySelector('input[name=uname]');


btn.onclick = function () {
    var psw_txt = psw.value;
    var uname_txt = uname.value;

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
    
}

