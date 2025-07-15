import Notification from "../models/notification.js";
import User from "../models/user.js";
import Cliente from "../models/cliente.js";

class NotificationsHandler  {   

    constructor(socket,users,clients){
      
        this.socket = socket;
       // this.notifications = new Map();
       this.users = users;
       this.clients = clients;
    }

    
    async onNotification(data){

        console.log("newNotification ",data)
        
        const notification ={
                message:data.message,
                type:data.type,
                link:data.link,
                data:data.data,
                title:data.title || "Notificación title",
        }

        if(data.from_client){
            notification.from_client = this.socket.clienteId
            
        }
        if(data.from_user){
            notification.from_user =this.socket.userId
        }
        if(data.to_user){
            if(data.to_user == "every_user") delete notification.to_user
            else {
                if(typeof data.to_user == "number"){
                    const user = await User.findOne({sqlite_id:data.to_user})
                    notification.to_user = user._id
                }else{
                    notification.to_user = data.to_user
                }
            }
             
            //notification.to_user = data.to_user
        }
        if(data.to_client){
            if(data.to_client == "every_client") delete notification.to_client
            else {
                if(typeof data.to_client == "number"){

                    console.log("data.to_client",data.to_client)
                    const client = await Cliente.findOne({sqlite_id:data.to_client})
                    notification.to_client = client._id
                }else{
                    notification.to_client = data.to_client
                }
            }
        }

        try {

            const _notification = new Notification(notification)
            await _notification.save()
            console.log("notification saved ",_notification)
            //recast notificatiosn to users
            if(data.to_user){
                //this.socket.emit('sendNotification',_notification)
                if(data.to_user == "every_user"){
                    this.recastToAllUsers(_notification)
                }else{
                    this.recastToUser(_notification)
                }
            }
            //recast notificatiosn to clients
            if(data.to_client){
                if(data.to_client == "every_client"){
                    this.recastToAllClients(_notification)
                }else{
                    this.recastToClient(_notification)
                }
                //this.socket.emit('sendNotification',_notification)
                
            }
           

        } catch (error) {
            console.log("error ",error)
        }
  
    }



    recastToUser(notification){

       const user = this.users.get(notification.to_user)

       user.user.notification.push(notification._id)
       user.user.save()
       user.emit('sendNotification',notification)
        
    }

    async recastToClient(notification){
        console.log("this.clients",this.clients)
        try {
            const client = this.clients.get(notification.to_client)
            if(client){
            client.client.notification.push(notification._id)
            await client.client.save()
            console.log("notificacion puesta",client.id)
            client.socket.emit('sendNotification',notification)
            }
        } catch (error) {
            console.log("error recastToClient ",error)
        }
       
    }
    

    recastToAllUsers(notification){
        try {
            console.log("this.users",this.users)
            this.users.forEach(async user => {
                if(user){
                    user.user.notification.push(notification)
                    await user.user.save()
                    console.log("notificacion puesta",user.id)
                    user.socket.emit('sendNotification',notification)
                }
            })
        } catch (error) {
            console.log("error recastToAllUsers ",error)
        }
    }

    recastToAllClients(notification){
        try {
            this.clients.forEach(client => {
                client.notification.push(notification)
                client.save()
                client.emit('sendNotification',notification)
            })
        } catch (error) {
            console.log("error recastToAllClients ",error)
        }
    }
    
}


    

export default NotificationsHandler;