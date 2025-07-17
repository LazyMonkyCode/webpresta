import UserSocket from "./User.js";
import User from "../models/user.js";
import Cliente from "../models/cliente.js";

class UsersSocket {

    constructor(io) {

        this.io = io;
        this.users = new Map();
    }

    async usersOnlineStatus(socket) {
        const users = await User.find({ _id: { $in: Array.from(this.users.keys()) } })
        socket.emit("usersOnlineStatus", { onlineUsers: users });
    }

    async appAuthentication(socket, next) {
        const user = await User.findOne({ sqlite_id: socket.decoded.id.toString() });
        if (!user) return next(new Error('Authentication error: User not found.'));
        socket.userId = user._id;
        socket.user = user;
        return true;
    }

    async authentication(socket, next) {

        console.log("asñkahsdkjasdaksjdaksjdaksjd")
        try {

           // console.log("socket.decoded.id", socket.decoded.id)
            //consolelog("socket.decoded.id", socket.decoded.id)

            console.log("user", socket.decoded.user)

            const query = typeof socket.decoded.user.id == "number" ? 
            { 
                sqlite_id: socket.decoded.user.id.toString() } 
            : { _id: socket.decoded.user.id.toString() }
            const user = await User.findOne(query);

           
           
          //  console.log("user12",user)
           /*    if (!user) {
 
                  user = new User({
                     sqlite_id: socket.decoded.id.toString(),
                     username: socket.decoded.username,
                     email: socket.decoded.email,
                     password: socket.decoded.password,
                     role: socket.decoded.role,
                     isAdmin: socket.decoded.role === 'admin',
                 })
 
                 await user.save()
             }  */

            socket.userId = user._id;
            socket.user = user;

           // console.log("socket.userId",socket.userId)
            return true

        } catch (error) {
            return next(new Error('Authentication error:1 User not found.'));
        }
        return false

    }

    async usersOnlineStatus(to) {
        this.io.to(to).emit('usersOnlineStatus', { onlineUsers: this.users });
    }

    async getUser(id) {
        const user = await User.findById(id);
        return user;
    }

    async setUser(socket, connectedClients) {

        //consolelog("connectedClients", connectedClients)
        // io.emit('userOnlineStatus', { userId: socket.clienteId, isOnline: true, onlineUsers: Array.from(connectedUsers.keys()) });
        const user = await User.findOne({ _id: socket.userId })

        //console.log("user222",user)
        if (user) {

            const _connectedUsers = Array.from(this.users.keys())
            const _connectedClients = Array.from(connectedClients.keys())

            console.log("new user connected ", socket.userId)
            
            const userSocket = new UserSocket(socket, user);
            userSocket.on("userDisconnected", function () {
                //consolelog("asdasdasd")
                //console.log("before remove user",this.users)
                this.removeUser(socket.userId)
                //console.log("after remove user",this.users)
                _connectedClients.forEach(async (cliente) => {
                    const client = connectedClients.get(cliente)
                    //consolelog("q onda cleinte manda el mensage")
                    if (client) {
                        client.socket.emit('userDisconnected', { userId: socket.userId, isOnline: false })
                        //consolelog("q onda cleinte manda el mensage 23")

                    }
                })
                /* this.users.forEach(async (user) => {
                    if (user.id === socket.userId) {
                        user.emit('userDisconnected', { userId: socket.userId })
                    }
                }) */
                //consolelog("user disconnected", socket.userId)
                this.removeUser(socket.userId)
            }.bind(this));

            this.users.set(socket.userId, userSocket);
            // this.users.set(socket.userId.toString(), socket.id);
            //consolelog('Connected users:', Array.from(this.users.keys()));


            const users = await User.find({ _id: { $in: _connectedUsers } });
            const clientes = await Cliente.find({ _id: { $in: _connectedClients } });

            socket.emit('usersOnlineStatus', { clientes: clientes, users: users })
            ////consolelog("clientesOnlineStatus",clientes)


            _connectedClients.forEach(async (cliente) => {
                //consolelog("cliente12312312123",cliente)
                const client = connectedClients.get(cliente)
                //consolelog("client 12312312",client)
                if (client) {

                    client.socket.emit('userConnected', { userId: socket.userId, isOnline: true, user: user });
                    //consolelog("userConnected", connectedClients.get(cliente.toString()))
                }
            })
        }
    }

    async removeUser(id) {
        //consolelog("removeUser",id)
        this.users.delete(id);
    }
    async getUsers() {
        const users = await User.find();
        return users;
    }

    emitToAllUsers(event, data) {
        this.users.forEach(user => {
            user.emit(event, data)
        })
    }


}

export default UsersSocket;