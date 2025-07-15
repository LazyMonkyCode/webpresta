import React, { useState, useEffect, useRef } from "react";
import { Mic, Smile, Send, Paperclip } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useSelector, useDispatch } from "react-redux";
i/* mport chatService from "../../services/chatSevice";
import {sendMessage} from "../../services/socketServices"
import { useSocket } from "../../context/socketContext";
import {setUser} from "../../redux/reducers/auth"
import {useNotification} from "../../components/Notifications" */

export default function ChatRoom() {
  const {user,token} = useSelector((state) => state.auth);
  const {messages, setMessages} = useSocket()

  /* const [messages, setMessages] = useState([
    
      {
        type: "text",
        content: "Hola, ¿cómo están todos?",
        user: {
          name: "Ana",
          avatar: "https://i.pravatar.cc/150?img=47",
        },
        time: "10:23",
      },
      {
        type: "file",
        file: {
          name: "reporte.pdf",
          size: 102400,
          type: "application/pdf",
          url: "#",
        },
        user: {
          name: "Carlos",
          avatar: "https://i.pravatar.cc/150?img=12",
        },
        time: "10:24",
      },
    
    
    {user: {
      name: "Ana",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    time: "10:23", type: "text", content: "Hola, ¿cómo están todos?" },
    { user: {
      name: "Ana",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    time: "10:23", type: "text", content: "Hola, ¿cómo están todos?" },

    {
      user: {
        name: "Ana",
        avatar: "https://i.pravatar.cc/150?img=47",
      },
      time: "10:23",
      type: "audio",
      content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // audio de ejemplo
    }
  ]); */
  const {showNotification,setNotification} = useNotification()
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState({})
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch()
  useEffect(()=>{
    const fetchRoom = async () => {
      /* const users = await User.find({})
      setUsers(users) */
      try{
        console.log(user)
      console.log(token)
      
        dispatch(setUser(await window.jwt.decode(token)))
      
      const room = await chatService.createRoom({name: "Room 1", description: "Description 1",
         is_private: false, owner: user?.id,type:"group",
          })
          console.log(room)
        const amIJoined = room.users.some(userRoom => userRoom.sqlite_id === user.sqlite_id)
        console.log(amIJoined)
        if(!amIJoined){
          await chatService.joinRoom(room._id, user.id)
          setUsers([...room.users,user])
        }
        setRoom(room)
        setUsers(room.users)
        setMessages(room.messages) 
      }catch(error){
        setNotification({
          title: "Error al crear la sala",
          message: error.message,
          type: "error",
          position: "top-right"
        })
        showNotification()
        console.log(error)
      }
    //  const rooms = await chatService.getRoom()
      //setRooms(rooms) 
    } 
    fetchRoom()
  },[])

  const sendMessage2 = (text) => {
    console.log(text)
    if (text) {
      
      const newMsg = {
        type: "text",
        content: text,
        user: { 
          ...user,
          name: user.username,
          avatar: "https://i.pravatar.cc/150?img=64",
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      sendMessage(newMsg,room._id)
      setMessages([...messages, newMsg]);
      setInput("");
      setShowEmojiPicker(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  

  const handleEmoji = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const toggleRecording = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setMessages((prev) => [...prev, {user: {
          name: "Tú",
          avatar: "https://i.pravatar.cc/150?img=64",
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: "audio", content: URL.createObjectURL(blob) }]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } else {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex h-[80vh] w-full bg-gray-100 text-sm">
      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
  <div key={idx} className="flex items-start gap-3">
    {/* Avatar */}
    <img
      src={"https://i.pravatar.cc/150?img=64"}
      alt={"Avatar"}
      className="w-8 h-8 rounded-full object-cover mt-1"
    />
    {/* Contenido */}
    <div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold">{"asdasdasd"}</span>
        <span className="text-xs text-gray-500">{msg.time}</span>
      </div>

      <div className="mt-1 bg-white px-4 py-2 rounded-xl shadow max-w-md">
        {msg.type === "text" && <p>{msg.content}</p>}

        {msg.type === "audio" && <audio controls src={msg.content} className="w-full" />}

        {msg.type === "file" && (
          <>
            {msg.file.type.startsWith("audio") && (
              <audio controls src={msg.file.url} className="w-full" />
            )}
            {msg.file.type.startsWith("video") && (
              <video controls src={msg.file.url} className="w-full rounded" />
            )}
            {!msg.file.type.startsWith("audio") &&
              !msg.file.type.startsWith("video") && (
                <div>
                  <p className="font-medium">{msg.file.name}</p>
                  <p className="text-xs text-gray-500">{msg.file.type}</p>
                  <p className="text-xs text-gray-400">
                    {(msg.file.size / 1024).toFixed(1)} KB
                  </p>
                  <a
                    href={msg.file.url}
                    download={msg.file.name}
                    className="text-blue-600 underline text-xs mt-1 inline-block"
                  >
                    Descargar
                  </a>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  </div>
))}


          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-white">
          <div className="relative flex gap-2 items-end">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile className="text-gray-500 w-6 h-6" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-0 z-10">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}

<label className="cursor-pointer">
  <input
    type="file"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setMessages((prev) => [
          ...prev,
          {
            user: {
              name: "Tú",
              avatar: "https://i.pravatar.cc/150?img=64",
            },
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "file",
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: url,
            },
          },
        ]);
      }
    }}
  />
  <Paperclip className="w-5 h-5 text-gray-500 hover:text-gray-700" />
</label>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  console.log(input)
                  sendMessage2(input);
                }
              }}
              className="flex-1 border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Escribe un mensaje..."
            />

            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg ${recording ? "bg-red-200" : "hover:bg-gray-200"}`}
            >
              <Mic className={`w-5 h-5 ${recording ? "text-red-600" : "text-gray-500"}`} />
            </button>

            <button
              onClick={() => sendMessage2(input)}
              className="p-2 rounded-lg hover:bg-blue-100"
            >
              <Send className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Panel */}
      <div className="w-64 border-l bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">Conectados</h2>
        <ul className="space-y-2">
          {users.map((user, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
