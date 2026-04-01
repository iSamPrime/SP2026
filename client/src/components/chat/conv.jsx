import Msg from './msg.jsx';
import { useState,  useEffect} from 'react';


export default function Conv({socketIo, mySession, roomId, setJoinedRoom, setActiveTap}){

    const date = new Date();
    const [msgs, setMsgs] = useState([])
    const [theMsg, setTheMsg] = useState("")
    
    function handleEnter(e){
        try{
          if(e.key === 'Enter' && !e.shiftKey){
              e.preventDefault()
              const text = theMsg.trim();
            
              if(!text) {alert("Empty message"); return}
            
              if(socketIo.connected){
                  socketIo.emit("sendMsg", roomId, text);
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

            socketIo.emit("room:join", roomId);

            const handleOldMsgs = (oldMsgs)=>{
                setMsgs(oldMsgs)
                console.log(oldMsgs)
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
    }, [roomId])



    

    return(

        <div className="py-2 ">
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