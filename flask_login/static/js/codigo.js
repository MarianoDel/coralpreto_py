var _c = console.log;
var d = document;
var aFrecuencias = [
	{
		id: '01',
		tx: '156.450',
		rx: '156.450',
		channel: '09'
	},
	{
		id: '02',
		tx: '156.600',
		rx: '156.600',
		channel: '12'	
	},
	{
		id: '03',
		tx: '156.700',
		rx: '156.700',
		channel: '14'	
	},
	{
		id: '04',
		tx: '156.575',
		rx: '156.575',
		channel: '71'	
	},
	{
		id: '05',
		tx: '156.625',
		rx: '156.625',
		channel: '72'
	},
	{
		id: '06',
		tx: '156.725',
		rx: '156.725',
		channel: '74'
	},
	{
		id: '07',
		tx: '156.875',
		rx: '156.875',
		channel: '77'	
	},
	{
		id: '08',
		tx: '161.675',
		rx: '157.075',
		channel: '81'	
	}
];

var	boton;
var contenedorDeBotones = d.getElementById('wrap_botones');

for (var i = 0; i < aFrecuencias.length; i++) {
	boton = d.createElement('button');
	boton.setAttribute('data-id',aFrecuencias[i].id);
	boton.setAttribute('data-tx',aFrecuencias[i].tx);
	boton.setAttribute('data-rx',aFrecuencias[i].rx);
	boton.setAttribute('data-channel',aFrecuencias[i].channel);
	boton.setAttribute('class','botones');
	boton.innerHTML = aFrecuencias[i].channel;
	boton.onclick = BotonSeleccionado;
	contenedorDeBotones.appendChild(boton);
}

var span1 = d.getElementById('tx');
var span2 = d.getElementById('rx');
var span3 = d.getElementById('channel');
var boton_play = d.getElementById('play');

span1.innerHTML = '- ';
span2.innerHTML = '- ';
span3.innerHTML = '- ';

function BotonSeleccionado () {
	var tx = this.getAttribute('data-tx');
	var rx = this.getAttribute('data-rx');
	var channel = this.getAttribute('data-channel');
	span1.innerHTML = tx;
	span2.innerHTML = rx;
	span3.innerHTML = channel;
	socket.emit( 'botones', {
		data: channel
	})
}

var btns = d.getElementsByClassName("botones");

function addEvent(objeto, evento, funcion, fase) {
	if(window.addEventListener) {
		objeto.addEventListener(evento, funcion, fase);
	} else {
		objeto.attachEvent('on' + evento, funcion);
	}
}

for (var i = 0; i < btns.length; i++) {
	addEvent(btns[i],
		'click',
		function () {
			var current = d.getElementsByClassName("activo");
			if (typeof current[0] === 'undefined' && boton_seleccionado == 0) {
				this.className += " activo";
				var id = this.getAttribute('data-id');
				var tx = this.getAttribute('data-tx');
				var rx = this.getAttribute('data-rx');
				var channel = this.getAttribute('data-channel');
				boton_play.setAttribute('data-id',id);
				boton_play.setAttribute('data-tx',tx);
				boton_play.setAttribute('data-rx',rx);
				boton_play.setAttribute('data-channel',channel);
			} if (typeof current[0] === 'object' && boton_seleccionado == 0) {
				current[0].className = current[0].className.replace(" activo", "");
				this.className += " activo";
				var id = this.getAttribute('data-id');
				var tx = this.getAttribute('data-tx');
				var rx = this.getAttribute('data-rx');
				var channel = this.getAttribute('data-channel');
				boton_play.setAttribute('data-id',id);
				boton_play.setAttribute('data-tx',tx);
				boton_play.setAttribute('data-rx',rx);
				boton_play.setAttribute('data-channel',channel);
			} 
		},
		true
	);
}

function cambiaBoton (canal) {
	for (var i = 0; i < aFrecuencias.length; i++) {
		if (btns[i].getAttribute('data-channel') == canal) {
			_c(aFrecuencias[i].id);
			_c(aFrecuencias[i].tx);
			_c(aFrecuencias[i].rx);
			btns[i].className += " activo";
		}
	}
}

var txt = '[{"nombre": "MED","comentario":"Alo","status":"0"},{"nombre": "MED2","comentario":"Alo2","status":"0"},{"nombre": "MED3","comentario":"Alo3","status":"1"}]';

function insert(txt) {
	var tabla_dinamica = d.querySelector('#usuarios');
	var tr, td_1, td_2,td_3, span, span_2;
	var aUsers = JSON.parse(txt);
	for (var i = 0; i < aUsers.length; i++) {
		tr = d.createElement('tr');
		tr.setAttribute('class','user');
		td_1 = d.createElement('td');
		td_2 = d.createElement('td');
		td_3 = d.createElement('td');
		span = d.createElement('span');
		span_2 = d.createElement('span');
		td_2.appendChild(span);
		td_1.innerHTML = aUsers[i].nombre;
		td_2.innerHTML = aUsers[i].comentario;
		td_3.innerHTML = '';
		if (aUsers[i].status == 0) {
			td_3.setAttribute('class','icon-primitive-dot red');
		} else {
			td_3.setAttribute('class','icon-primitive-dot green');
		}
		td_2.appendChild(span_2);
		tr.appendChild(td_1);
		tr.appendChild(td_2);
		tr.appendChild(td_3);
		tabla_dinamica.appendChild(tr);
	}
}

insert(txt);

var txt = d.querySelector('.apretando');

function apreto() {
	txt.innerHTML = 'En Transimision!!!';
	socket.emit( 'ptt', {
		data: 'ON'
	})
}

function suelto() {
	txt.innerHTML = 'Soltaste......';
	socket.emit( 'ptt', {
		data: 'OFF'
	})
}

var socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('tabla', function(msg) {
	var filas = d.querySelectorAll(".user");
	for (i = 0; i < filas.length; i++) {
		filas[i].remove();
	}
	insert(msg);
})

socket.on('boton_canal', function(msg) {
	msg_canal = msg.data;
	console.log('msg_canal: ' + msg_canal);
	cambiaBoton(msg_canal);
})

