const gpios = require('./gpios');

gpios.GpiosInit();

function InitialValues () {
    gpios.LedBlueOff();
    gpios.OnOff_Off();
    gpios.Ptt_Off();
    gpios.Bit0_Off();
    gpios.Bit1_Off();
    gpios.Bit2_Off();    
}

function TestBlue () {
    console.log ("start blinking blue led for 10 secs");
    gpios.LedBlueBlinking_On();
    setTimeout(() => {
        gpios.LedBlueBlinking_Off();
        console.log("ending toggling");
    }, 10000);    
}

function TestPtt () {
    (async () => {
        console.log ("Ptt on for 5 secs");
        gpios.Ptt_On();
        await setTimeout(() => {
            gpios.Ptt_Off();
            console.log("Ptt off");
        }, 5000);
    })();
}

function TestEncendido () {
    (async () => {    
        console.log ("Encendido on for 5 secs");
        gpios.OnOff_On();
        await setTimeout(() => {
            gpios.OnOff_Off();
            console.log("Encendido off");
        }, 5000);
    })();
}


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const TestChannel = async () => {
    var channel_array = ['09', '12', '14', '71', '72', '74', '77', '81'];

    console.log ("Enciendo radio, espero 20 segundos");    
    gpios.OnOff_On();
    await sleep (20000);
    for (var i = 0; i < channel_array.length; i++)
    {
        gpios.ChannelToGpios(channel_array[i]);
        console.log("memory: " + i + " test channel: " + channel_array[i]);
        await sleep(5000);
    }
    console.log ("Apagando radio");
    gpios.OnOff_Off();    
}


////////////////
// Main Tests //
////////////////
InitialValues();
// TestBlue();
// TestPtt();
// TestEncendido();
TestChannel();

