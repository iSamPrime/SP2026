import { useState,  useEffect} from 'react';

import Msg from './msg.jsx';
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

            socketIo.emit("getOldMsgs", roomInfo.room_id)

            socketIo.on("roomError", (errorMsg) =>{
                setJoinedRoom(null)
                alert(errorMsg)
            });
            socketIo.once("oldMsgs", (oldMsgs)=>{
                setMsgs(oldMsgs)
            });
            socketIo.on("msgback", (msg) => {
                setMsgs((prev) => [...prev, msg]);
            });
            socketIo.on("editedMsg", (newMsg)=>{
                setMsgs((prev) => prev.map((msg) =>
                    msg.msg_id === newMsg.msg_id
                        ? { ...msg, msg_content: newMsg.msg_content, edited_at: newMsg.edited_at }
                        : msg
                ))
            })

                
        } catch(error) {
            console.log(error);
            setMsgs([]);
            alert(error)
        }
    }, [socketIo, roomInfo.room_id])
    
    useEffect( ()=>{ 
        try{
            setActiveTap(11)

            socketIo.emit("getOldMsgs", roomInfo.room_id)

            socketIo.on("roomError", (errorMsg) =>{
                setJoinedRoom(null)
                alert(errorMsg)
            });
            socketIo.once("oldMsgs", (oldMsgs)=>{
                setMsgs(oldMsgs)
            });
            socketIo.on("msgback", (msg) => {
                setMsgs((prev) => [...prev, msg]);
            });
            socketIo.on("editedMsg", (newMsg)=>{
                setMsgs((prev) => prev.map((msg) =>
                    msg.msg_id === newMsg.msg_id
                        ? { ...msg, msg_content: newMsg.msg_content, edited_at: newMsg.edited_at }
                        : msg
                ))
            })
            socketIo.on("editedMsg", (newMsg) => {
                console.log("editedMsg received", newMsg)
                setMsgs((prev) => prev.map((msg) =>
                    msg.msg_id === newMsg.msg_id
                        ? { ...msg, msg_content: newMsg.msg_content, edited_at: newMsg.edited_at }
                        : msg
                ))
            })


            
                
        } catch(error) {
            console.log(error);
            setMsgs([]);
            alert(error)
        }
        return () => {
            socketIo.off("roomError")
            socketIo.off("oldMsgs")
            socketIo.off("msgback")
            socketIo.off("editedMsg")
        }
    }, [socketIo, roomInfo.room_id])

    const css = {
        textarea: "w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 mt-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all ",

    }

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
            
        <div className={`flex flex-col`}>           
            {msgs?.map((msg, i) => (
                <Msg 
                    m={msg} 
                    i={i}
                    mySession={mySession} 
                    css={css}
                    msgs={msgs}
                    setMsgs={setMsgs}
                    socketIo={socketIo}
                />
            ))}
        </div>

        <textarea 
            type="text" 
            value={theMsg} 
            onChange={(e) => setTheMsg(e.target.value)} 
            onKeyDown={handleEnter}
            placeholder='Type your message...'
            className={css.textarea}
        />
    </div>
)}