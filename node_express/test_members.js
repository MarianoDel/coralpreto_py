const members = require('./members');

////////////////
// Main Tests //
////////////////

members.showMembers();

console.log('add new member juan');
if (members.addMember('juan', 'gil')) {
    console.log('add ok');
} else {
    console.log('something went wrong in add');
}

console.log('\nnow\n');
members.showMembers();


console.log('del member admin');
if (members.delMember('admin')) {
    console.log('del ok');
} else {
    console.log('something went wrong in del');
}


console.log('\nnow\n');
members.showMembers();


console.log('check if miguel is manager');
if (members.isManager('miguel')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if admin is manager');
if (members.isManager('admin')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if maxi is manager');
if (members.isManager('maxi')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if juan is manager');
if (members.isManager('juan')) {
    console.log('YES');
} else {
    console.log('NO');
}


console.log('check maxi password');
if (members.checkUserPass('maxi', 'maxi')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}

console.log('check admin password');
if (members.checkUserPass('admin', 'admin')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}

console.log('check maxi wrong password');
if (members.checkUserPass('maxi', 'mxai')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}

console.log('save the array');
members.saveMembersArray();





