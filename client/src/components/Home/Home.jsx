import { useState } from 'react';
import { io } from 'socket.io-client'
const socketIo = io('http://localhost:5555')

import Conv from '../chat/conv.jsx';
import Header from './Header.jsx';
import RoomSearch from '../chat/RoomSearch.jsx';
import DashBoard from '../DropMenu.jsx/DashBoard.jsx';
import Profile from '../DropMenu.jsx/Profile.jsx';
import Settings from '../DropMenu.jsx/Settings.jsx';
import Auth from '../auth/auth.jsx';




export default function Home({mySession, activeTap, setActiveTap}){

    const [joinedRoom, setJoinedRoom] = useState(null)
    const [roomName, setRoomName] = useState("");
    const [navOpen, setNavOpen] = useState(false); 

    const Css = {
    buttonNav: "bg-black/60 text-white px-3 py-2 rounded-lg border border-white/5 text-left transform transition-transform duration-300 ease-in-out hover:scale-105",
    img: "w-12 h-12 rounded-full object-cover",
    imgDiv: "flex items-center justify-center w-16 h-16 rounded-lg overflow-hidden flex-shrink-0",
    };

    function exitRoom(){
        setActiveTap(1)
        setJoinedRoom(null)
    }

return (<>

    <Header 
        navOpen={navOpen} 
        setNavOpen={setNavOpen} 
        Css={Css} 
        setActiveTap={setActiveTap} 
        activeTap={activeTap} 
        exitRoom={exitRoom} 
        mySession={mySession}
        

    />

    <div className="max-w-2xl mx-auto py-8 px-4 ">

        {activeTap > 9 &&     
            <div className="flex justify-between items-center px-8 py-4">
                <h2 className="font-bold text-2xl">
                    {
                        roomName || 
                        (activeTap === 21 && "Profile") || 
                        (activeTap === 22 && "Dash Board") || 
                        (activeTap === 23 && "Settings") || 
                        (activeTap === 24 && "Log out") ||
                        "Room Name Error"
                    }
                </h2>
                <button
                    onClick={() => exitRoom()}
                    aria-label="Leave room"
                    className="text-slate-400 hover:text-red-500 transition-colors font-bold text-3xl leading-none"
                >
                    ×
                </button>
            </div>   
        } 


        <div className="bg-white rounded-2xl shadow-lg p-8 py-4 ">      
            { 
            (activeTap === 21 && <Profile/>) || 
            (activeTap === 22 && <DashBoard socketIo={socketIo} />) || 
            (activeTap === 23 && <Settings/>) || 
            (activeTap === 24 && <Auth mySession={mySession}/> ) ||
            console.log(activeTap)
            }

            {joinedRoom ?    
                <Conv /* 11 */
                socketIo = {socketIo} 
                mySession={mySession} 
                roomId={joinedRoom} 
                setJoinedRoom={setJoinedRoom}
                roomName={roomName}
                setActiveTap={setActiveTap}
                />
            : activeTap < 10 &&
                
                <RoomSearch /* 1 */
                setJoinedRoom={setJoinedRoom} 
                setRoomName={setRoomName}
                roomName={roomName}
                socketIo = {socketIo} 
                
                />
            }
        </div>
     </div>

</>)
}

