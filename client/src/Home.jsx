import { useState, useEffect } from 'react';
import { io } from 'socket.io-client'
import Conv from './chat/conv.jsx';
import RoomSearch from './chat/RoomSearch.jsx';
import Auth from './auth/auth.jsx';



const socketIo = io('http://localhost:5555')

export default function Home({mySession}){

    const [joinedRoom, setJoinedRoom] = useState(null)
    const [roomName, setRoomName] = useState("");

    return(<>
        <Auth mySession={mySession} ></Auth>
        {joinedRoom ? 
            <Conv 
            socketIo = {socketIo} 
            mySession={mySession} 
            roomId={joinedRoom} 
            setJoinedRoom={setJoinedRoom}
            roomName={roomName}
            />
        :
            <RoomSearch 
            setJoinedRoom={setJoinedRoom} 
            setRoomName={setRoomName}
            roomName={roomName}
            socketIo = {socketIo} 
            
            />
        }
    
    </>)
}

