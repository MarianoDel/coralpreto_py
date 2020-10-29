// INSERCIÓN DE USERS EN CPANEL

var _c = console.log;
var d = document;

var txt2 = '[{"nombre": "MED CPANEL","password": "12345","comentario":"Alo","status":"0"},{"nombre": "MED2 CPANEL","password": "123444445","comentario":"Alo","status":"0"}]';
var tabla_dinamica_cpanel = d.querySelector('#usuarios_cpanel');
function insert2(txt) {
	

	//Recibe el JSON que mandas
// var txt = '[{"nombre": "MED","comentario":"Alo","status":"0"},{"nombre": "MED2","comentario":"Alo2","status":"0"},{"nombre": "MED3","comentario":"Alo3","status":"1"}]';
	var tr, td_1, td_2, boton_1;
	var aUsers = JSON.parse(txt2);

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

var timer_activo = false;
function myFunctionBoton2 () {
    if (!timer_activo) {
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
}

function Redirect () {
    window.location.href = "index.html";
}

var btn = d.querySelector('input[value=REGISTER]');
var psw = d.querySelector('input[name=psw]');
var uname = d.querySelector('input[name=uname]');


btn.onclick = function () {
	var psw_txt = psw.value;
	var uname_txt = uname.value;
	var aUsers = JSON.parse(txt2);
	aUsers.push({
	  nombre: uname_txt,
	  password: psw_txt,
	  comentario: 'Rushdfdfdsfdsabh',
	  status: '0'
	});
	_c(aUsers);
	var myJSON = JSON.stringify(aUsers);
	txt2 = myJSON;

	var filas = d.querySelectorAll("#usuarios_cpanel tr");
	for (i = 0; i < filas.length; i++) {
		filas[i].remove();
	}
    insert2(txt2);

    insertHTMLenAddUser("");
}

    insertHTMLenRegister("");


