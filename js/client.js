const socket=io();

const form=document.getElementById('send_container');
const messegeArea=document.querySelector('.container');
const text=document.getElementById('text1');


function append(msg,position){
    var newMsg=document.createElement('div');
    newMsg.innerText=msg;
    newMsg.classList.add('messege',position);
    messegeArea.append(newMsg);

}
const name =prompt("enter");
socket.emit('user-connected',name);

socket.on('new_user_connected',name=>{
    append(`${name} has joined`,'left');
})