const running_on_slackware = 1;
const running_on_raspbian = !running_on_slackware;

if (running_on_raspbian)
{
    var Gpio = require('onoff').Gpio;
    console.log("gpios running on raspbian: " + running_on_raspbian);
}
else
    console.log("gpios running on slackware: " + running_on_slackware);


// Module Constants ------------------------------------------------------------
const LED_B = 14;    //led blue servidor gpio14
const ON_OFF = 15;
const PTT = 18;
const BIT2 = 23;
const BIT1 = 24;
const BIT0 = 25;


// Module Scope Variables ------------------------------------------------------
var ledBlue;
var on_off;
var ptt;
var bit2;
var bit1;
var bit0;


function GpiosInit() {
    if (running_on_raspbian) {
        ledBlue = new Gpio(LED_B, 'out');
        on_off = new Gpio(ON_OFF, 'out');
        ptt = new Gpio(PTT, 'out');
        bit2 = new Gpio(BIT2, 'out');
        bit1 = new Gpio(BIT1, 'out');
        bit0 = new Gpio(BIT0, 'out');
        console.log("gpios initialized on raspbian");
    } else {
        console.log("gpios initialize");
    }
}


//////////////
// LED Blue //
//////////////
function LedBlueOn() {
    if (running_on_raspbian) {
        ledBlue.writeSync(1);
    } else {
        console.log("led blue on");
    }
}

function LedBlueOff() {
    if (running_on_raspbian) {
        ledBlue.writeSync(0);
    } else {
        console.log("led blue off");
    }
}

var already_blinking = 0;
var blinkInterval;
function LedBlueBlinking_On () {
    if (!already_blinking)
    {
        blinkInterval = setInterval(LedBlueBlinking_Callback, 700); //run the blinkLED function every 700ms
        already_blinking = 1;
    }
}

function LedBlueBlinking_Off () {
    clearInterval(blinkInterval); // Stop blink intervals
    LedBlueOff();
    already_blinking = 0;
}

function LedBlueBlinking_Callback () {
    if (running_on_raspbian) {
        if (ledBlue.readSync() === 1)
            LedBlueOff();
        else
            LedBlueOn();
    } else {
        console.log("led blue cb");
    }
}


////////////////
// ON/OFF Pin //
////////////////
function OnOff_On() {
    if (running_on_raspbian) {
        on_off.writeSync(1);
    } else {
        console.log("onoff on");
    }
}

function OnOff_Off() {
    if (running_on_raspbian) {
        on_off.writeSync(0);
    } else {
        console.log("onoff off");
    }
}


/////////
// Ptt //
/////////
function Ptt_On() {
    if (running_on_raspbian) {
        ptt.writeSync(1);
    } else {
        console.log("ptt on");
    }
}

function Ptt_Off() {
    if (running_on_raspbian) {
        ptt.writeSync(0);
    } else {
        console.log("ptt off");
    }
}


//////////
// Bit2 //
//////////
function Bit2_On() {
    if (running_on_raspbian) {
        bit2.writeSync(1);
    } else {
        console.log("bit2 on");
    }
}

function Bit2_Off() {
    if (running_on_raspbian) {
        bit2.writeSync(0);
    } else {
        console.log("bit2 off");
    }
}


//////////
// Bit1 //
//////////
function Bit1_On() {
    if (running_on_raspbian) {
        bit1.writeSync(1);
    } else {
        console.log("bit1 on");
    }
}

function Bit1_Off() {
    if (running_on_raspbian) {
        bit1.writeSync(0);
    } else {
        console.log("bit1 off");
    }
}


//////////
// Bit0 //
//////////
function Bit0_On() {
    if (running_on_raspbian) {
        bit0.writeSync(1);
    } else {
        console.log("bit0 on");
    }
}

function Bit0_Off() {
    if (running_on_raspbian) {
        bit0.writeSync(0);
    } else {
        console.log("bit0 off");
    }
}


function ChannelToGpios (channel_string) {
    switch (channel_string)
    {
        case '09':
        Bit0_Off();
        Bit1_Off();
        Bit2_Off();
        break;

        case '12':
        Bit0_On();
        Bit1_Off();
        Bit2_Off();
        break;

        case '14':
        Bit0_Off();
        Bit1_On();
        Bit2_Off();
        break;

        case '71':
        Bit0_On();
        Bit1_On();
        Bit2_Off();
        break;

        case '72':
        Bit0_Off();
        Bit1_Off();
        Bit2_On();
        break;

        case '74':
        Bit0_On();
        Bit1_Off();
        Bit2_On();
        break;

        case '77':
        Bit0_Off();
        Bit1_On();
        Bit2_On();
        break;

        case '81':
        Bit0_On();
        Bit1_On();
        Bit2_On();
        break;
        
        default:
        Bit0_Off();
        Bit1_Off();
        Bit2_Off();
        break;
    }
}

function GpiosToChannel () {
    if ((bit0.readSync() === 0) &&
        (bit1.readSync() === 0) &&
        (bit2.readSync() === 0))
    {
        return '09';
    }

    if ((bit0.readSync() === 1) &&
        (bit1.readSync() === 0) &&
        (bit2.readSync() === 0))
    {
        return '12';
    }

    if ((bit0.readSync() === 0) &&
        (bit1.readSync() === 1) &&
        (bit2.readSync() === 0))
    {
        return '14';
    }

    if ((bit0.readSync() === 1) &&
        (bit1.readSync() === 1) &&
        (bit2.readSync() === 0))
    {
        return '71';
    }

    if ((bit0.readSync() === 0) &&
        (bit1.readSync() === 0) &&
        (bit2.readSync() === 1))
    {
        return '72';
    }

    if ((bit0.readSync() === 1) &&
        (bit1.readSync() === 0) &&
        (bit2.readSync() === 1))
    {
        return '74';
    }

    if ((bit0.readSync() === 0) &&
        (bit1.readSync() === 1) &&
        (bit2.readSync() === 1))
    {
        return '77';
    }

    if ((bit0.readSync() === 1) &&
        (bit1.readSync() === 1) &&
        (bit2.readSync() === 1))
    {
        return '81';
    }
}

// Module Exported Funtions ----------------------------------------------------
exports.GpiosInit = GpiosInit;

exports.LedBlueOn = LedBlueOn;
exports.LedBlueOff = LedBlueOff;
exports.LedBlueBlinking_On = LedBlueBlinking_On;
exports.LedBlueBlinking_Off = LedBlueBlinking_Off;

exports.OnOff_On = OnOff_On;
exports.OnOff_Off = OnOff_Off;

exports.Ptt_On = Ptt_On;
exports.Ptt_Off = Ptt_Off;

exports.Bit0_On = Bit0_On;
exports.Bit0_Off = Bit0_Off;

exports.Bit1_On = Bit1_On;
exports.Bit1_Off = Bit1_Off;

exports.Bit2_On = Bit2_On;
exports.Bit2_Off = Bit2_Off;

exports.ChannelToGpios = ChannelToGpios;
exports.GpiosToChannel = GpiosToChannel;


