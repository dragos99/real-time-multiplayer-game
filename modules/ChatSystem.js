'use strict';


var ChatSystem = function(){
	this.newMessages = [];

}





/**
 * 
 * New message
 * 
 */

ChatSystem.prototype.newMessage = function(data){
	this.newMessages.push({
		sender: data.sender,
		msg: data.msg
	});
}





/**
 * 
 * Clear new messages
 * 
 */

ChatSystem.prototype.clearNewMessages = function(){
	this.newMessages.length = 0;
}


ChatSystem.prototype.getNewMessages = function(){
	return this.newMessages;
}



module.exports = ChatSystem;