import { useState,  useEffect} from 'react';

import Msg from './msgs.jsx';
import Title from '../Home/title.jsx'

export default function Room({socketIo, mySession, setActiveTap, roomInfo, joinedRoom, setJoinedRoom}){

    const [msgs, setMsgs] = useState([])
    const [theMsg, setTheMsg] = useState("")


    
    function handleEnter(e){
        try{
          if(e.key === 'Enter' && !e.shiftKey){
              e.preventDefault()
              const text = theMsg.trim();
            
              if(!text) {alert("Empty message"); return}
            
              if(socketIo.connected){
                    const msg = {
                      roomId: roomInfo.room_id, 
                      text: text,
                    }

                    socketIo.emit("sendMsg", msg );
                    setTheMsg('');
              } else {
                  alert("Connection lost!"); return;
              }
          } else return
        } catch(error) {
          console.log(error)
        }
    }    

    useEffect( ()=>{ 
        try{
            setActiveTap(11)
         
            const handleOldMsgs = (oldMsgs)=>{
                setMsgs(oldMsgs)
            };

            const handleMsg = (msg) => {
                setMsgs((prev) => [...prev, msg]);
            };

            const alertErr = (errorMsg) =>{
                setJoinedRoom(null)
                alert(errorMsg)
            };


            socketIo.on("roomError", alertErr);
            socketIo.on("oldMsgs", handleOldMsgs);
            socketIo.on("msgback", handleMsg);
                

            return () => {
                socketIo.off("oldMsgs", handleOldMsgs);
                socketIo.off("msgback", handleMsg);
            };
        } catch(error) {
            console.log(error);
            setMsgs([]);
            alert(error)
        }
    }, [])


    return(

        <div className="py-2 ">

            <Title 
                socketIo={socketIo}
                title={roomInfo.room_name}
                setActiveTap={setActiveTap}
                isRoom={true}
                joinedRoom={joinedRoom}
                setJoinedRoom={setJoinedRoom}
                roomId={roomInfo.room_id}
            />

                <div className=''>
                    <p className='text-xl'>
                        Room ID: {roomInfo.room_id}
                    </p>
                    <p className='text-sm text-gray-500'>
                        {roomInfo.room_description}
                    </p>
                </div>

            <Msg msgs={msgs} mySession={mySession} />

            <textarea 
                type="text" 
                value={theMsg} 
                onChange={(e) => setTheMsg(e.target.value)} 
                onKeyDown={handleEnter}
                placeholder='Type your message...'
                className='w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 mt-2 text-sm 
                focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 
                transition-all '
            />
        </div>

    )
}