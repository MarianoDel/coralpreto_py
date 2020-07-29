const members = require('./members');

////////////////
// Main Tests //
////////////////
members.membersShowMembers();

console.log('add new member juan');
if (members.membersAddMember('juan', 'gil')) {
    console.log('add ok');
} else {
    console.log('something went wrong in add');
}

console.log('\nnow\n');
members.membersShowMembers();


console.log('del member admin');
if (members.membersDelMember('admin')) {
    console.log('del ok');
} else {
    console.log('something went wrong in del');
}


console.log('\nnow\n');
members.membersShowMembers();


console.log('check if miguel is manager');
if (members.membersIsManager('miguel')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if admin is manager');
if (members.membersIsManager('admin')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if maxi is manager');
if (members.membersIsManager('maxi')) {
    console.log('YES');
} else {
    console.log('NO');
}

console.log('check if juan is manager');
if (members.membersIsManager('juan')) {
    console.log('YES');
} else {
    console.log('NO');
}


console.log('check maxi password');
if (members.membersCheckUnamePsw('maxi', 'maxi')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}

console.log('check admin password');
if (members.membersCheckUnamePsw('admin', 'admin')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}

console.log('check maxi wrong password');
if (members.membersCheckUnamePsw('maxi', 'mxai')) {
    console.log('YES psw good');
} else {
    console.log('NO wrong psw');
}






