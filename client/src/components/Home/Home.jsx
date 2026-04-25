import { useState, useEffect } from 'react';
import { io } from 'socket.io-client'
const socketIo = io('http://localhost:5555')


import Header from './Header.jsx';
import RoomSearch from '../chat/RoomSearch.jsx';
import DashBoard from '../DropMenu.jsx/DashBoard.jsx';
import Profile from '../DropMenu.jsx/Profile.jsx';
import Settings from '../DropMenu.jsx/Settings.jsx';
import Auth from '../auth/auth.jsx';
import Room from '../chat/room.jsx';


export default function Home({mySession, activeTap, setActiveTap}){

    const [joinedRoom, setJoinedRoom] = useState(false)
    const [navOpen, setNavOpen] = useState(false);
    const [roomInfo, setRoomInfo] = useState([])

    const Css = {
    buttonNav: "bg-black/60 text-white px-3 py-2 rounded-lg border border-white/5 text-left transform transition-transform duration-300 ease-in-out hover:scale-105",
    img: "w-12 h-12 rounded-full object-cover",
    imgDiv: "flex items-center justify-center w-16 h-16 rounded-lg overflow-hidden flex-shrink-0",
    };

    useEffect(()=>{
        function handelErr(err) {
            alert(err);
            console.log(err)
        };
        socketIo.on("error", handelErr)
    },[socketIo])

return (<>

    <Header 
        navOpen={navOpen} 
        setNavOpen={setNavOpen} 
        Css={Css} 
        setActiveTap={setActiveTap} 
        activeTap={activeTap} 
        mySession={mySession}
    />

    <div className="max-w-2xl mx-auto py-8 px-4 ">
        <div className="bg-white rounded-2xl shadow-lg p-8 py-4 ">      
        { 
            (activeTap === 21 && <Profile setActiveTap={setActiveTap}/>) || 
            (activeTap === 22 && <DashBoard setActiveTap={setActiveTap} socketIo={socketIo} />) || 
            (activeTap === 23 && <Settings setActiveTap={setActiveTap}/>) || 
            (activeTap === 24 && <Auth setActiveTap={setActiveTap} mySession={mySession}/> ) ||
            (joinedRoom &&    
                <Room /* 11 */
                    socketIo = {socketIo} 
                    mySession={mySession} 
                    setJoinedRoom={setJoinedRoom}
                    joinedRoom={joinedRoom}
                    setActiveTap={setActiveTap}
                    roomInfo={roomInfo}
                />
            ) 
            || 
            (activeTap < 10 &&
                <RoomSearch /* 1 */
                    setRoomInfo={setRoomInfo} 
                    socketIo = {socketIo} 
                    setJoinedRoom={setJoinedRoom}
                />
            )
            ||
            (console.log(activeTap))
        }
        </div>
     </div>

</>)
}

