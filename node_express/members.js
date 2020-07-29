const fs = require('fs');

let rawdata = fs.readFileSync('members.json');
let members = JSON.parse(rawdata);

console.log(members);


function membersIsMember (uname) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname)
            answer = true;
    });

    return answer;
}


function membersCheckUnamePsw (uname, psw) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname) {
            if (element.password == psw)
                answer = true;
        }
    });

    return answer;
}


function membersIsManager (uname) {
    let answer = false;
    
    members.forEach(element => {
        if (element.name == uname) {
            if (element.can_manage == 'true')
                answer = true;
        }
    });

    return answer;
}


function membersAddMember (uname, psw, manager = 'false') {
    let answer = false;
    
    if (!membersIsMember(uname)) {
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


function membersDelMember (uname) {
    let answer = false;
    
    if (membersIsMember(uname)) {
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


function membersShowMembers () {
    console.log(members);    
}


module.exports.membersCheckUnamePsw = membersCheckUnamePsw;
module.exports.membersIsManager = membersIsManager;
module.exports.membersAddMember = membersAddMember;
module.exports.membersDelMember = membersDelMember;
module.exports.membersShowMembers = membersShowMembers;
