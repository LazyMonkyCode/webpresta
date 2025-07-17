import jwt from "jsonwebtoken";

import UsersSocket from "./Users.js";
import ClientsSocket from "./Clients.js";
import NotificationsHandler from "./Notificationshandler.js";


//import app from "../index.js";
/* import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3005", "http://localhost:3006"]
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    }, 
    methods: ["GET", "POST"]
  }
}) */

class SocketHandler {

    constructor(io,options) {
        this.io = io;
        this.JWT_SECRET = options.auth.token;

        this.io.use(this.authentication.bind(this));

        this.io.on("connection", async (socket) => {
            console.log("a user connected");
            await this.handleConnection(socket);
        })

        this.usersSocket = new UsersSocket(this.io);
        this.clientsSocket = new ClientsSocket(this.io);

    }

    getIoServer(){
        return this.io;
    }


    async authentication(socket, next) {

        const token = socket.handshake.auth.token;
        //console.log("token",token)

        if (!token) {
            next(new Error('Authentication error: Token not provided'));

        }
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);

            socket.decoded = decoded;


            console.log("decoded",decoded)
            //Si el usuario viene de la app, se debe verificar si es un usuario
            if (decoded.user && typeof decoded.user.id === "number") {
                console.log("nombeer")
                const authUserSuccess =await this.usersSocket.authentication(socket, next);
                console.log("authUserSuccess",authUserSuccess)
                if(authUserSuccess) return next()
                return next(new Error('Authentication error:No User found.'));

            } else {
            //Si el usuario viene de la web, se debe verificar si es un cliente o un usuario
                try {
                    console.log("otra cosa")
                    const authClientSuccess =await this.clientsSocket.authentication(socket, next);

                    if(authClientSuccess) return next()
                    //console.log("authClientSuccess",authClientSuccess)
                    const authUserSuccess =await this.usersSocket.authentication(socket, next);
                    //console.log("authUserSuccess",authUserSuccess)


                    if(authUserSuccess) return next()

                    return next(new Error('Authentication error:No Client nor User found.'));

                   



                   
    
                } catch (error) {
                    console.error('Socket authentication error:', error.message);
                    return next(new Error('Authentication error:No Client asd nor User found.'));
                }
              
            }

        } catch (err) {
            console.error('Socket authentication error:', err.message);
            return next(new Error('Authentication error'));
        }
    }

    async handleConnection(socket) {

            console.log("socket.userId",socket.user)

        if (socket.userId) {
            await this.usersSocket.setUser(socket,this.clientsSocket.clients);
        }
        if (socket.clienteId) {
            await this.clientsSocket.setClient(socket,this.usersSocket.users);

        }

        socket.on("userOnlineStatus",this.usersSocket.usersOnlineStatus.bind(this.usersSocket));
        socket.on("clientOnlineStatus",this.clientsSocket.clientsOnlineStatus.bind(this.clientsSocket));

        socket.on('loan_request_created', async (data) => {
            const { prestamoId, clienteId, clienteNombre, amount, disbursementDate, purpose, timestamp } = data;
            const users = await User.find();
            if(users){
                users.forEach(async user => {
                    const socket = this.usersSocket.users.get(user._id.toString());
                    if(socket){
                        socket.emit('loan_request_created', data);
                    }
                });
            }

            
        });


        
        
        const notificationHandler = new NotificationsHandler(socket,this.usersSocket.users,this.clientsSocket.clients);
        socket.on("new-notification",notificationHandler.onNotification.bind(notificationHandler));
    }

    async handleDisconnect(socket) {
        if (socket.userId) {
            await this.usersSocket.removeUser(socket.userId);
        }
        if (socket.clienteId) {
            await this.clientsSocket.removeClient(socket.clienteId);
        }

        console.log("a user disconnected");
    }


}



export default SocketHandler;