"use strict";

var ChatSystem = function(){
	this.opened = false;

	this.chatBox = document.getElementById('chat_box');
	this.msgBox = document.getElementById('msg_box');
	this.inputBox = document.getElementById('input_box');
	this.backgroundColor = 'rgba(10, 106, 173, 0.3)';
	this.msgBoxBackgroundColor = 'rgba(0, 0, 0, 0.3)'
}

ChatSystem.prototype.sendMessage = function(){
	this.message = this.inputBox.children[0].value;
	Socket.sendChatMessage(this.message);

	this.inputBox.children[0].value = '';
}

ChatSystem.prototype.receiveMessage = function(data){
	var msgClass = 'chat_msg all wordwrap';
	if(Chat.opened === false)
		msgClass += ' closed';

	var html = '<div class="'+ msgClass +'"><span class="msg_sender">'+ data.sender +': </span><span class="msg_content">'+ data.msg +'</span></div>';

	DOM.newChatMessage(html);
}