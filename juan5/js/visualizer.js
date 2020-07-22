
var start_button = document.getElementById('start'),
        radios = document.querySelectorAll('input[name="radio-selection"]'),
        radios_length = radios.length,
        audioContext,
        masterGain;


// ========================================================
// Audio Setup
// ========================================================

function audioSetup() {
    var source;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();


    unlockAudioContext(audioContext);

    function unlockAudioContext(audioContext) {
  if (audioContext.state === 'suspended') {
    var events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    var unlock = function unlock() {
      events.forEach(function (event) {
        document.body.removeEventListener(event, unlock)
      });
      audioContext.resume();
    };

    events.forEach(function (event) {
      document.body.addEventListener(event, unlock, false)
    });
  }
}












    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);

    for(var i = 0, max = radios_length; i < max; i++) {
        if(radios[i].checked === true) {
            source = radios[i].value;
        }
    }

    var song = new Audio(source),
    songSource  = audioContext.createMediaElementSource(song),
    songPlaying = false;
    song.crossOrigin = 'anonymous';
    songSource.connect(masterGain);

    for(var i = 0, max = radios_length; i < max; i++) {
        radios[i].addEventListener('change', function() {
            if(songPlaying) {
                song.pause();
                start_button.innerHTML = 'Start Audio';
                songPlaying = !songPlaying;
            }

            // Without these lines the oscilloscope won't update
            // when a new selection is made via radio inputs
            song = new Audio(this.value);
            
            songSource  = audioContext.createMediaElementSource(song),
            song.crossOrigin = 'anonymous';

            songSource.connect(masterGain);
        });
    }

  start_button.addEventListener('click', function() {

    if(songPlaying) {
      song.pause();
            start_button.innerHTML = 'Start Audio';
    } else {
      song.play();
            drawOscilloscope();
            updateWaveForm();
            start_button.innerHTML = 'Stop Audio';
    }

        songPlaying = !songPlaying;
  });
}

audioSetup();


// ========================================================
// Create Wave Form
// ========================================================

const analyser = audioContext.createAnalyser();
masterGain.connect(analyser);

const waveform = new Float32Array(analyser.frequencyBinCount);
analyser.getFloatTimeDomainData(waveform);

function updateWaveForm() {
  requestAnimationFrame(updateWaveForm);
  analyser.getFloatTimeDomainData(waveform);
}


// ========================================================
// Draw Oscilloscope
// ========================================================

function drawOscilloscope() {
    requestAnimationFrame(drawOscilloscope);

    const scopeCanvas = document.getElementById('oscilloscope');
    const scopeContext = scopeCanvas.getContext('2d');

    scopeCanvas.width = waveform.length;
    scopeCanvas.height = 200;

    scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height);
  scopeContext.beginPath();

    for(var i = 0; i < waveform.length; i++) {
    const x = i;
    const y = ( 0.5 + (waveform[i] / 2) ) * scopeCanvas.height;
        

        if(i == 0) {
      scopeContext.moveTo(x, y);
    } else {
      scopeContext.lineTo(x, y);
    }
  }

    scopeContext.strokeStyle= '#5661FA';
    scopeContext.lineWidth = 2;
    scopeContext.stroke();
}
