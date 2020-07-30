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

var contenedorDeBotones, boton;
contenedorDeBotones = d.getElementById('wrap_botones');

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


var boton_seleccionado = '0'; //esta variable vas a tener que pisar con el valor que vas a mandar con el socket

function BotonSeleccionado () {
	var tx = this.getAttribute('data-tx');
	var rx = this.getAttribute('data-rx');
	var channel = this.getAttribute('data-channel');
	span1.innerHTML = tx;
	span2.innerHTML = rx;
	span3.innerHTML = channel;
	boton_seleccionado = 0;

    var json_msg = JSON.stringify({"botones" : channel});
    socket.send(json_msg);
}



var btns = d.getElementsByClassName("botones");
//btns[0].className += " activo"; //Agrego el activo al boton todos

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
    _c('puto');
    for (var i = 0; i < aFrecuencias.length; i++) {

        if (btns[i].getAttribute('data-channel') == canal) {
            _c(aFrecuencias[i].id);
            _c(aFrecuencias[i].tx);
            _c(aFrecuencias[i].rx);
            btns[i].className += " activo";
            span1.innerHTML = aFrecuencias[i].tx;
            span2.innerHTML = aFrecuencias[i].rx;
            span3.innerHTML = canal;
        } else {
            btns[i].setAttribute('class','botones');
        }
    }
}

cambiaBoton(boton_seleccionado);







var txt = '[{"nombre": "MED","comentario":"Alo","status":"0"},{"nombre": "MED2","comentario":"Alo2","status":"0"},{"nombre": "MED3","comentario":"Alo3","status":"1"}]';
var txt2 = '[{"nombre": "MED se la come","comentario":"Lo sabe todo el mundo!!!","status":"1"}]';
var tabla_dinamica = d.querySelector('#usuarios');
function insert(txt) {
	

	//Recibe el JSON que mandas
// var txt = '[{"nombre": "MED","comentario":"Alo","status":"0"},{"nombre": "MED2","comentario":"Alo2","status":"0"},{"nombre": "MED3","comentario":"Alo3","status":"1"}]';
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


// var oscillator;
var ptt_txt = d.querySelector('.apretando');
var send_mic_audio = false;
function apreto() {
    if (socket.readyState == WebSocket.OPEN) {
        ptt_txt.innerHTML = 'PTT On!';
        _c('ptt in on');
        var json_msg = JSON.stringify({"ptt" : "ON"});
        socket.send(json_msg);
        send_mic_audio = true;
    } else {
        ptt_txt.innerHTML = 'Server disconnected!!';
    }
    // oscillator = createOscillator();
    // oscillator.start();
}
function suelto() {
    ptt_txt.innerHTML = 'PTT Off';
    _c('ptt in off');
    send_mic_audio = false;
    if (socket.readyState == WebSocket.OPEN) {
        var json_msg = JSON.stringify({"ptt" : "OFF"});
        socket.send(json_msg);
    }
    // oscillator.stop();    
}

// Cambio de boton PLAY a PAUSE
var play_pause_button_in_play = true;
function playFunction() {
    if (play_pause_button_in_play) {
	boton_play.style.backgroundImage='url(img/pause_button.png)';
        play_pause_button_in_play = false;
        var json_msg = JSON.stringify({"audio" : "PLAY"});
        socket.send(json_msg);
    } else {
        boton_play.style.backgroundImage='url(img/play_button.png)';
        play_pause_button_in_play = true;
        var json_msg = JSON.stringify({"audio" : "STOP"});
        socket.send(json_msg);
        flush_counters();
    }

    // insert_wrapper(txt2);
}

// limpia la tabla y agrega las nuevas filas en formato json
function insert_wrapper (json_txt) {
    var filas = d.querySelectorAll(".user");
    for (i = 0; i < filas.length; i++) {
    	filas[i].remove();
    }
    insert(json_txt);
}


// Con websocket
var socket;
if (location.protocol !== 'https:') {
    socket = new WebSocket('ws://' + document.domain + ':' + location.port);
} else {
    socket = new WebSocket('wss://' + document.domain + ':' + location.port);
}

socket.onopen = () => {
    var json_msg = JSON.stringify({"ws_open" : "client"});
    socket.send(json_msg);
}

const fr = new FileReader();
fr.onload = () => {
    // It worked
    const array = new Int16Array(fr.result);
    createSoundSource_int16(array);
};

fr.onerror = () => {
    // The read failed, handle/report it
    console.log('blob packet error');
};

socket.onmessage = e => {
    // console.log(' typeof ws data: ' + typeof(event.data) + ' binaryType: ' + socket.binaryType);
    if ((e.data instanceof ArrayBuffer) || (e.data instanceof Blob))
    {
        var size = e.data.size;
        console.log('blob size: ' + size);
        if ((fr.readyState == 0) || (fr.readyState == 2))
            fr.readAsArrayBuffer(e.data);
    }
    else if (typeof e.data === "string")
    {
        console.log('Message from server:' + e.data);
        try {
            var json_msg = JSON.parse(event.data);
            if (json_msg.tabla != undefined)
            {
                var a_tabla = json_msg.data;
                var lines = '[';
                var first_line = true;
                a_tabla.forEach(obj => {
                    // console.log(obj)
                    if (first_line) {
                        lines += '{\"nombre\": ' + '\"' + obj.nombre + '\",' +
                            '\"comentario\": ' + '\"' + obj.comentario + '\",' +
                            '\"status\": ' + '\"' + obj.status + '\"},';
                        first_line = false;
                    } else {
                        lines += '{\"nombre\": ' + '\"' + obj.nombre + '\",' +
                            '\"comentario\": ' + '\"' + obj.comentario + '\",' +
                            '\"status\": \"0\"},';
                    }
                });

                lines = lines.substring(0, lines.length - 1);
                lines += ']';
                console.log(lines);
                insert_wrapper(lines);
            }
            else if (json_msg.boton_canal != undefined)
            {
                console.log("boton_canal: " + json_msg.boton_canal);
                cambiaBoton(json_msg.boton_canal);
                // cambiaBoton('72');                
            }
        }
        catch {
        }
    }
}


// Audio webkit
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var nextStartTime = 0;
var buffer_time = 0;
var buffer_underrun = 0;

function flush_counters () {
    nextStartTime = 0;
}

function createSoundSource_int16 (audio_int16array) {
    // audioCtx.resume();    //soluciona error con chrome
    // var audiobuf = new Int16Array(audioData);
    var audiobuf = audio_int16array;
    // console.log('audiobuf lenght: '+ audiobuf.length);

    // creo el buffer de audio, pido referencia y le copio las muestras
    audioBuffer = audioCtx.createBuffer(1, audiobuf.length, 44100);
    var samples_ref = audioBuffer.getChannelData(0);
    // samples_ref.set(audiobuf);

    for (var i = 0; i < audiobuf.length; i++) {
        samples_ref[i] = audiobuf[i] / 32768;
    }      

    //audioBuffer.getChannelData(0).set(audiobuf_f);

    // genero senoidal de 200Hz a 44100Hz, un segundo de largo
    // const freq = 200;
    // const samplerate = 44100;
    // const secs = 10;
    // const amplitude = 0.5;
      
    //var senbuf = new Int16Array(samplerate * secs);
    //console.log('senbuf.len: '+ senbuf.length);

    //audioBuffer = audioCtx.createBuffer(1, senbuf.length, samplerate);
    //var samples_ref = audioBuffer.getChannelData(0);
    
    //for (var i = 0; i < senbuf.length; i++) {
    //                    samples_ref[i] = amplitude * Math.sin(6.28 * freq * i / samplerate);
    //                    }      
      
    var source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    if (nextStartTime == 0) {
        // este es el primer paquete
        // me guardo el primer buffer y ajusto los contadores
        buffer_time = audioBuffer.length / audioBuffer.sampleRate;              
        nextStartTime = audioCtx.currentTime + buffer_time;
        console.log('int16 chunk time: '+ buffer_time + ' next start: ' + nextStartTime);        
    } else {
        // los paquetes que siguen
        if (buffer_underrun < audioCtx.currentTime) {
            //se agoto el primer buffer dejo pasar un schedule
            nextStartTime = audioCtx.currentTime + buffer_time;
            console.log('underrun: ' + buffer_underrun + ' current: ' + audioCtx.currentTime);
        }
        else {
            // todavia tengo algo de buffer calculo el tiempo de comienzo del proximo chunk
            nextStartTime = buffer_underrun;
        }
    }

    buffer_underrun = nextStartTime + buffer_time;
    // console.log('under: ' + buffer_underrun)
    source.start(nextStartTime);

}


// Oscillator
function createOscillator () {
    if (!audioCtx)
        console.log('no context!!!');
    else {
        // create Oscillator node
        var oscillator = audioCtx.createOscillator();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); // value in hertz
        oscillator.connect(audioCtx.destination);
        
        const start = () => oscillator.start();
        const stop = () => oscillator.stop();
        console.log('oscillator created use start or stop to use it');
        return { start, stop };        
    }
}


navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
    const audioContext = new AudioContext();
    // get mic stream
    const source = audioContext.createMediaStreamSource( stream );
    // const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
    const scriptNode = audioContext.createScriptProcessor(16384, 1, 1);    
    source.connect(scriptNode);
    scriptNode.connect(audioContext.destination);
    // output to speaker
    // source.connect(audioContext.destination);

    // on process event
    scriptNode.onaudioprocess = (e) => {
        // get mica data        
        // console.log(e.inputBuffer.getChannelData(0))
        if (send_mic_audio) {
            var inputChannel = e.inputBuffer.getChannelData(0);
            var inputChannel_len = inputChannel.length;
            console.log('mic input: ' + typeof inputChannel + ' mic size: ' + inputChannel_len);
            var buffer = new ArrayBuffer (inputChannel_len * Int16Array.BYTES_PER_ELEMENT);
            var view_buffer = new Int16Array (buffer);
            for (var i = 0; i < inputChannel_len; i++) {
                view_buffer[i] = inputChannel[i] * 32767;
            }
            console.log('send: ' + typeof buffer +
                        ' size: ' + buffer.byteLength);
            socket.bufferType = "arraybuffer";
            socket.send(buffer);
        }
    }
}).catch(function(err) {
    console.log("Error on getUserMedia: " + err);
});


// get permission to use mic
// window.navigator.getUserMedia({ audio:true }, (stream) => {
//     const audioContext = new AudioContext();
//     // get mic stream
//     const source = audioContext.createMediaStreamSource( stream );
//     // const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
//     const scriptNode = audioContext.createScriptProcessor(16384, 1, 1);    
//     source.connect(scriptNode);
//     scriptNode.connect(audioContext.destination);
//     // output to speaker
//     // source.connect(audioContext.destination);

//     // on process event
//     scriptNode.onaudioprocess = (e) => {
//         // get mica data        
//         // console.log(e.inputBuffer.getChannelData(0))
//         if (send_mic_audio) {
//             var inputChannel = e.inputBuffer.getChannelData(0);
//             var inputChannel_len = inputChannel.length;
//             console.log('mic input: ' + typeof inputChannel + ' mic size: ' + inputChannel_len);
//             var buffer = new ArrayBuffer (inputChannel_len * Int16Array.BYTES_PER_ELEMENT);
//             var view_buffer = new Int16Array (buffer);
//             for (var i = 0; i < inputChannel_len; i++) {
//                 view_buffer[i] = inputChannel[i] * 32767;
//             }
//             console.log('send: ' + typeof buffer +
//                         ' size: ' + buffer.byteLength);
//             socket.bufferType = "arraybuffer";
//             socket.send(buffer);
//         }
//     };
// }, console.log);



// var oscillator = createOscillator();
// oscillator.start();
// const timeout_osc = setTimeout(() => {
//   oscillator.stop();
// }, 2000);

/*
for (var i = 0; i < aUsers.length; i++) {
	tr = d.createElement('tr');
	td_1 = d.createElement('td');
	td_2 = d.createElement('td');
	span = d.createElement('span');
	span_2 = d.createElement('span');
	td_2.appendChild(span);
	td_1.innerHTML = aUsers[i].name;
	if (aUsers[i].status == 0) {
		span_2.innerHTML = 'Desconectado';
		span.setAttribute('class','icon-primitive-dot red');
	} else {
		span_2.innerHTML = 'Conectado';
		span.setAttribute('class','icon-primitive-dot green');
	}
	td_2.appendChild(span_2);
	tr.appendChild(td_1);
	tr.appendChild(td_2);

	tabla_dinamica.appendChild(tr);
}

var audio = new Audio();
audio.src = 'audio/audio.mp3';
audio.controls = true;
audio.loop = true;
audio.autoplay = true;
// Establish all variables that your Analyser will use
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;
// Initialize the MP3 player after the page loads all of its HTML into the window
window.addEventListener("load", initMp3Player, false);
function initMp3Player(){
	document.getElementById('audio_box').appendChild(audio);
	context = new (window.AudioContext || window.webkitAudioContext)();
	analyser = context.createAnalyser(); // AnalyserNode method
	canvas = document.getElementById('analyser_render');
	ctx = canvas.getContext('2d');
	// Re-route audio playback into the processing graph of the AudioContext
	source = context.createMediaElementSource(audio); 
	source.connect(analyser);
	analyser.connect(context.destination);
	frameLooper();
}
// frameLooper() animates any style of graphics you wish to the audio frequency
// Looping at the default frame rate that the browser provides(approx. 60 FPS)
function frameLooper(){
	window.RequestAnimationFrame(frameLooper);
	fbc_array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(fbc_array);
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	ctx.fillStyle = '#00CCFF'; // Color of the bars
	bars = 100;
	for (var i = 0; i < bars; i++) {
		bar_x = i * 3;
		bar_width = 2;
		bar_height = -(fbc_array[i] / 2);
		//  fillRect( x, y, width, height ) // Explanation of the parameters below
		ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
	}
}
*/







