


function getSocketIndex (sk_this, sklist) {
    let sk_index = 0;
    let sk_finded = 0;
    sklist.forEach(element => {
        if (sk_this == element) {
            sk_finded = sk_index;
        }
        sk_index++;
    });

    return sk_finded;
}


function getUserNameBySocket (sk_this, sklist, clients_array) {
    let uname = "";
    let index = 0;

    index = getSocketIndex(sk_this, sklist);
    uname = clients_array[index].client;

    return uname;
}


function getSocketLostName (sklist, sklist_bkp, clients_array) {
    let sk_index = 0;
    let sk_lost_finded = 0;
    let current_qtty = sklist.size;
    let bkp_qtty = sklist_bkp.size;
    console.log('actual ws: ' + current_qtty +
                ' bkp ws: ' + bkp_qtty);
    try {
        sklist_bkp.forEach(element => {
            if (!sklist.has(element)) {
                sk_lost_finded = sk_index;
            }
            sk_index++;
        });
    } catch {}

    const user_disconneted = clients_array[sk_lost_finded].client;
    console.log('lost finded on: ' + sk_lost_finded +
                ' user: ' + user_disconneted +
                ' disconnected');
    clients_array.splice(sk_lost_finded, 1);
    console.log(clients_array);
    copySets(sklist_bkp, sklist);

    return user_disconneted;
}


function copySets (dest, orig) {
    let q_orig = orig.size;
    dest.clear();
    
    orig.forEach(element => {
        dest.add(element);
    });
}


function socketSendBroadcast (msg, sklist) {
    sklist.forEach(s => {
        s.send(msg);
    });
}

function socketSendBroadcastNoSelf (msg, sk_this, sklist) {
    sklist.forEach(s => {
        if (s != sk_this)
            s.send(msg);
    });
}

// Exported Functions ----------------------------------------------------------
module.exports.getSocketIndex = getSocketIndex;
module.exports.getUserNameBySocket = getUserNameBySocket;
module.exports.getSocketLostName = getSocketLostName;
module.exports.copySets = copySets;
module.exports.socketSendBroadcast = socketSendBroadcast;
module.exports.socketSendBroadcastNoSelf = socketSendBroadcastNoSelf;
