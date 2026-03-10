import dotenv from "dotenv";
dotenv.config();
import Msg from './msg.jsx';
import { useState,  useEffect} from 'react';


export default function Conv({socketIo, mySession}){
    const date = new Date();
    
    async function getMsgs() {
        const msgs = await fetch(process.env.URL + "/room/" + roomId)
    }


    useEffect(()=>{
        try{
            
            socketIo.on("connect", () => {
                socketIo.on("msgback", (msgs)=>{
                    if(socketIo.connected){
                        setMsgs(msgs)
                    }
                })
            })
        } catch(error) {
            console.log(error)
        }
    }, [])

    const [msgs, setMsgs] = useState(null)
    const [theMsg, setTheMsg] = useState("")

    function handleEnter(e){
        try{
          if(e.key === 'Enter' && !e.shiftKey){
              e.preventDefault()
              const text = theMsg.trim();
            
              if(!text) {alert("Empty message"); return}
            
              if(socketIo.connected){
                  socketIo.emit("msg", text);
                  setTheMsg('');
              } else {
                  alert("Connection lost!"); return;
              }
          } else return
        } catch(error) {
          console.log(error)
        }
    }


    

    return(
        <div 
            className="grid max-w-90 
            bg-gray-600 border-2 border-black rounded-xl p-1
            gap-2"
        >
            <Msg msgs={msgs} mySession={mySession} />
            <textarea 
                type="text" value={theMsg} 
                onChange={(e) => setTheMsg(e.target.value)} 
                onKeyDown={handleEnter}
                placeholder='Type here..'
                className='bg-gray-500 rounded-xl border-1 border-black px-2 py-1 h-16 focus:outline-sky-500'
            ></textarea>

        </div>
    )
}