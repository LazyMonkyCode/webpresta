import jwt from "jsonwebtoken";
import Cliente from "../models/cliente.js";
import ClientSocket from "./Client.js";
import User from "../models/user.js";

class ClientsSocket {

    constructor(io) {
        this.io = io;
        this.clients = new Map();
    }

    async clientsOnlineStatus(socket) {
        const clients = await Cliente.find({ _id: { $in: Array.from(this.clients.keys()) } })
        socket.emit("clientsOnlineStatus", { onlineClientes: clients });

    }

    async authentication(socket, next) {
        try {
            const cliente = await Cliente.findOne({ _id: socket.decoded.id });

            if (!cliente) {
                return false;
            }

            socket.clienteId = cliente._id;
            socket.cliente = cliente;

            return true;

        } catch (error) {
            return next(new Error('Authentication error: Client not found.'));
        }


    }

    async getClient(id) {
        const client = await Cliente.findById(id);
        return client;
    }

    async getClients() {
        const clients = await Cliente.find();
        return clients;
    }

    async setClient(socket, connectedUsers) {

        //console.log("new client connected ", socket.clienteId)


        let _connectedClientes = Array.from(this.clients.keys())
        let _connectedUsers = Array.from(connectedUsers.keys())

        /* const clients = await Cliente.find({ _id: { $in: _connectedClientes } });
        //consolelog("clients",clients)
 */
        const Users = await User.find({ _id: { $in: _connectedUsers } })
        //consolelog("Users",Users)
        socket.emit("usersOnlineStatus", Users);

        /* this.clients.set(socket.clienteId.toString(), socket.id);
        //consolelog('Connected clients:', Array.from(this.clients.keys())); */
        // io.emit('userOnlineStatus', { userId: socket.clienteId, isOnline: true, onlineUsers: Array.from(connectedUsers.keys()) });
        const cliente = await Cliente.findOne({ _id: socket.clienteId })



        if (cliente) {



            const clientSocket = new ClientSocket(socket, cliente);
            clientSocket.on("clienteRemoved", this.removeClient.bind(this));

            clientSocket.on("clientDisconnected", function () {
                connectedUsers.forEach(user => {
                    user.socket.emit('clienteDisconnected', { clienteId: socket.clienteId });
                });
                //consolelog("clientDisconnected",connectedUsers)
            });
            this.clients.set(socket.clienteId, clientSocket);
            //const clientes = await Cliente.find({ _id: { $in: _connectedClientes } });
            /* const users = await User.find({ _id: { $in: _connectedUsers } })
            socket.emit('usersOnlineStatus', { onlineUsers: users }) */
            //socket.emit('clientesOnlineStatus',{onlineClientes:clientes,onlineUsers:users})

            connectedUsers.forEach(async (user) => {
                if (user) {
                    //consolelog("clientConnected", user.id)
                    user.socket.emit('clienteConnected', { cliente, isOnline: true });

                }
            })
            //socket.emit('userOnlineStatus', { });
        }


    }



    removeClient(id) {
        //consolelog("removeClient",id)
        this.clients.delete(id);
    }


    emitToAllClients(event, data) {
        this.clients.forEach(client => {
            client.emit(event, data)
        })
    }

}

export default ClientsSocket;