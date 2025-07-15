import Cliente from "../models/cliente.js";

class Socket{

     constructor(socket){

        this.id = socket.clienteId;
        this.client = null;
        this.socket = socket;

        this.socket.on("message",this.onMessage.bind(this));

        this.socket.on("disconnect",this.onDisconnect.bind(this));

       

        this.socket.on("joinRoom",this.onJoinRoom.bind(this));

        this.socket.on("sendMessage",this.onSendMessage.bind(this));

        this.socket.on("typing",this.onTyping.bind(this));

        this.socket.on("disconnect",this.onDisconnect.bind(this));
        
    }


    emit(data){
        this.socket.emit(data)
    }
    
    async onTyping(data){
        console.log('typing event received:', data);
        // const receiverSocketId = connectedUsers.get(data.receiverId.toString());
        // if (receiverSocketId) io.to(receiverSocketId).emit('userTyping', { senderId: socket.clienteId, isTyping: data.isTyping });
     }
     async onDisconnect(){
        console.log(`User disconnected: ${socket.id}, ClienteID: ${socket.clienteId || 'Anonymous'}`);
        if (socket.clienteId) {
          connectedUsers.delete(socket.clienteId.toString());
          console.log('Connected clients after disconnect:', Array.from(connectedUsers.keys()));
          const users = await User.find({_id:{$in:Array.from(connectedUsers.keys())}})
          if(users){
            users.forEach(async(user)=>{
              io.to(connectedUsers.get(user._id.toString())).emit('clienteDisconnected',{clienteId:socket.clienteId})
            })
          }
          
          //io.emit('userOnlineStatus', { clienteId: socket.clienteId, isOnline: false, onlineUsers: Array.from(connectedUsers.keys()),onlineClientes: Array.from(connectedClientes.keys()) });
        }
        if (socket.userId) {
          connectedUsers.delete(socket.userId.toString());
          console.log('Connected users after disconnect:', Array.from(connectedUsers.keys()));
          io.emit('userDisconnected', { userId: socket.userId, isOnline: false });
        }
      }
    
    async onJoinRoom(data){
        //console.log("joinRoom",data)
        const room = await Room.findOne({_id:data.roomId})
        const user = await User.findOne({_id:socket.userId})
        const client = await Cliente.findOne({_id:socket.clienteId})
  
        const isUserOrClient = user ? "user" : "client"
        
        if(isUserOrClient === "user"){
          user.isConnected = true
          await user.save()
  
          if(room){
            room.connected_users.push(socket.userId)
            await room.save()
          }
          
        }
        if(isUserOrClient === "client"){
          client.isConnected = true
          await client.save()
  
          if(room){
            room.connected_clients.push(socket.clienteId)
            await room.save()
          }
        }
  
       
      }
  
      async onSendMessage(data){
        console.log("sendMessage",data)
        // data should include: { receiverId: string (clienteId), content: string }
        console.log('sendMessage event received:', data, 'from clienteId:', socket.clienteId);
  
        // Further implementation will go here: save message, emit to receiver, create notification.
        const room = await Room.findOne({_id:data.roomId}).populate('users').populate('clients')
        console.log("room",room)
        
        if(room){
          const message = new Message({
            user_sender:data.user_sender ? data.user_sender : null,
            client_sender:data.client_sender ? data.client_sender : null,
            content:data.content,
            type:data.type,
            time:data.time,
            room:room._id
          })
          await message.save()
  
          room.messages.push(message)
          await room.save()
        }
        room.users.forEach(async(user)=>{
          
       
            const user_id = connectedUsers.get(user._id.toString())
          
            if(user_id){
              
              io.to(user_id).emit('reciveMessage', {...data,user:{
               ...user,
                name:user.username,
                avatar:"https://i.pravatar.cc/150?img=64"
              }})
            }
            /* user1.notifications.push(data)
            await user1.save() */
          
          //generar una ntificacion y mandarla
         /*  const notification = new Notification({
            user:user,
            message:data.content,
            room:room,
            type:"message"
          })
   */
  
    })
        
      }
  


    async setClient(){
            const client = await Cliente.findById(this.id);
            return client;
    }

    async onDisconnect(){
        console.log("client disconnected ",this.socket.clienteId)
    }

    async onNotification(notification){
        console.log("notification ",notification)
    }

    async getClient(id){
        const client = await Cliente.findById(id);
        return client;
    }
    
    async getClients(){
        const clients = await Cliente.find();
        return clients;
    }
    
    
    onMessage(message){
        this.socket.emit("message",message);
    }
    
}

export default Socket;