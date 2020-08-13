const fs = require('fs');

let rawdata = fs.readFileSync('members.json');
let members = JSON.parse(rawdata);


function isMember (uname) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname)
            answer = true;
    });

    return answer;
}


function checkUserPass (uname, psw) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname) {
            if (element.password == psw)
                answer = true;
        }
    });

    return answer;
}


function isManager (uname) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname) {
            if (element.can_manage == 'true')
                answer = true;
        }
    });

    return answer;
}


function addMember (uname, psw, manager = 'false') {
    let answer = false;
    
    if (!isMember(uname)) {
        let json_entry = {
            "name": uname,
            "password": psw,
            "can_manage": manager
        }
 
        members.push(json_entry);
        answer = true;
    }

    return answer;
}


function delMember (uname) {
    let answer = false;
    
    if ((isMember(uname)) && (!isManager(uname))){
        let array_index = 0;
        let index = 0;        
        
        members.forEach(element => {
            if (element.name == uname) {
                array_index = index;                    
            }
            index++;
        });

        members.splice(array_index, 1);
        answer = true;
    }
    return answer;
}


function showMembers () {
    console.log(members);    
}


function getMembersName () {
    var resp = [];

    members.forEach(element => {
        if (element.can_manage == "false")
            resp.push(element.name);
    });

    return resp;
    
}

function saveMembersArray () {
    fs.writeFileSync('members.json', JSON.stringify(members));
}

// function loadMembersArray () {
//     let rawdata = fs.readFileSync('members.json');
//     let m = JSON.parse(rawdata);
//     return m;
// }

module.exports.checkUserPass = checkUserPass;
module.exports.isManager = isManager;
module.exports.isMember = isMember;
module.exports.addMember = addMember;
module.exports.delMember = delMember;
module.exports.getMembersName = getMembersName;
module.exports.showMembers = showMembers;
module.exports.saveMembersArray = saveMembersArray;
