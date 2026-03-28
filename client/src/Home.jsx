import { useState } from 'react';
import { io } from 'socket.io-client'
import Conv from './chat/conv.jsx';
import RoomSearch from './chat/RoomSearch.jsx';
const socketIo = io('http://localhost:5555')



export default function Home({mySession,activeTap,setActiveTap}){

    const [joinedRoom, setJoinedRoom] = useState(null)
    const [roomName, setRoomName] = useState("");
    const [navOpen, setNavOpen] = useState(false);

    const Css = {
    buttonNav: "bg-black/60 text-white px-3 py-2 rounded-lg border border-white/5 text-left transform transition-transform duration-300 ease-in-out hover:scale-105",
    img: "w-12 h-12 rounded-full object-cover",
    imgDiv: "flex items-center justify-center w-16 h-16 rounded-lg overflow-hidden flex-shrink-0",
    };

return (<>
    <header 
        className={`
            flex items-center justify-between gap-4 px-4 py-3 
            bg-gradient-to-r from-black from-25%  ${activeTap < 10 && "via-yellow-500 via-50%"}  to-sky-500 to-75%  
            border-b shadow-lg border-white/5
        `}
    >
        <div className={Css.imgDiv}>
            <img className={Css.img} src="/wavechat.png" alt="Logo" />
        </div>

        <div className="flex-1" />


        <div 
            className="relative flex items-center gap-2 flex-shrink-0 bg-black/80 rounded-xl border border-white/10 hover:bg-white/10"   
            onMouseEnter={() => setNavOpen(true)}
            onMouseLeave={() => setNavOpen(false)}
        >
            <div className={Css.imgDiv}>
                <img className={Css.img} src="profileDef.jpg" alt="Profile picture" />
            </div>

            <p className='max-w-25 overflow-hidden text-white'>{mySession}EDIT</p>

            <div className="ml-5 pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="6" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                </svg>
            </div>

            {navOpen && (
                <>
                    <div className="absolute left-0 top-full w-full h-3" />
                    <div className="absolute left-0 top-full mt-3 w-full bg-slate-800 rounded-lg p-2 shadow-lg border border-white/5 z-20">
                        <nav className="flex flex-col gap-2">
                            <button className={Css.buttonNav}>Profile</button>
                            <button className={Css.buttonNav}>Dashboard</button>
                            <button className={Css.buttonNav}>Settings</button>
                        </nav>
                    </div>
                </>
            )}
        </div>

    </header>
        
    {
        activeTap === 21 ? 
            ""
        : (activeTap === 22 ? 
            ""
            : activeTap === 23 ? 
                ""
                : (joinedRoom ?
                    <Conv /* 11 */
                    socketIo = {socketIo} 
                    mySession={mySession} 
                    roomId={joinedRoom} 
                    setJoinedRoom={setJoinedRoom}
                    roomName={roomName}
                    setActiveTap={setActiveTap}
                    />
                :
                    <RoomSearch /* 1 */
                    setJoinedRoom={setJoinedRoom} 
                    setRoomName={setRoomName}
                    roomName={roomName}
                    socketIo = {socketIo} 
                    
                    />
                )
        )
    }

</>)
}

