


class Messages{

    constructor(socket){
        this.messages = [];
        this.socket = socket;
    }

    sendMessage(message){
        this.socket.emit("message",message);
    }
    
    
    
}

export default Messages;