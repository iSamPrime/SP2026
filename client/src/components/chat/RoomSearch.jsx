import { useState } from 'react';
import AddMembers from './AddMembers.jsx';



export default function RoomSearch({ setRoomInfo, socketIo, setJoinedRoom}){
    

    const [joinRoomId, setJoinRoomId] = useState('')
    const [members, setMembers] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");


    const handleCreateRoom = () => {
        socketIo.emit("creRoom", { roomName: roomName, roomDescription: roomDescription, users: members})
        socketIo.once("crtdRoom", (room)=>{
            if(room.status === "Error"){
                alert(room.error)
            } else if(room.status === "Success"){
                handelJoinRoom(room.room_id);
            }

        })
    };

    function handelJoinRoom(roomId){
        try{      
            const targetRoomId = roomId || joinRoomId;
            socketIo.emit("room:join", targetRoomId);
            socketIo.once("roomInfo", (statusInfo)=>{
                if(statusInfo.status){
                    setRoomInfo(statusInfo.roomInfo) 
                    setJoinedRoom(true)
                } else{
                    setJoinedRoom(false)
                    alert(statusInfo.error)
                }
            });
            

        } catch(error) {
            console.log(error);
            alert(error)
        }
    }

    const handelEnterRoomWithEnter = (e)=>{
        if(e.key === "Enter"){
            e.preventDefault();
            handelJoinRoom();
        }
    }

    return(
        <div className=" space-y-10">

            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                    Join Room
                </h2>
                <p className="text-sm text-gray-600 text-center">
                    Enter the room ID to join an existing room
                </p>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                        type="number" 
                        placeholder="Enter room ID..." 
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        onKeyDown={handelEnterRoomWithEnter}
                    />
                    <button 
                        className="max-w-20 bg-gray-800 text-white border-2 border-gray-800 rounded-lg py-3 px-4 font-medium hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 outline-none"
                        type="submit"
                        onClick={() => handelJoinRoom()}
                    >
                        Join
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                    Create Room
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">
                            Room Name
                        </p>
                        <input 
                            type="text" 
                            placeholder="Enter room name..." 
                            value={roomName} 
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all" 
                        />
                    </div>

                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">
                            Room Description
                        </p>
                        <textarea 
                            type="text" 
                            placeholder="Enter room description... (Max 2000 Charactar)" 
                            value={roomDescription} 
                            onChange={(e) => setRoomDescription(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all" 
                        />
                    </div>

                    <AddMembers members={members} setMembers={setMembers} />

                    <button  
                        className="w-full bg-gray-800 text-white border-2 border-gray-800 rounded-lg py-3 px-4 font-medium hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 outline-none" 
                        onClick={() =>handleCreateRoom()}
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
)}
