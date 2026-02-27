import Msg from './msg.jsx';
import { useState, useRef, useEffect} from 'react';
import { io } from 'socket.io-client'


export default function Conv({msgs}){
    const socketRef = useRef(null);

    useEffect(()=>{
        socketRef.current = io();
        socketRef.current.on("connect", () => {
            console.log(socketRef.current.id); 
        })
    }, [])

    const [theMsg, setTheMsg] = useState("")

    function handleEnter(e){
      if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            const text = theMsg.trim();

            // REMOVE THIS LINE LATER 
            console.log(text)

            if(!text) {alert("Empty message"); return}
        
            if(socketRef.current.connected){
                socketRef.current.emit("msg", text);
                setTheMsg('');
            } else {
                alert("Connection lost!"); return;
            }

        } else return

    }

    return(
        <div 
            className="grid max-w-100 
            bg-gray-600 border-2 border-black rounded-xl p-1
            gap-2"
        >
            <Msg msgs={msgs} />
            <textarea 
                type="text" value={theMsg} 
                onChange={(e) => setTheMsg(e.target.value)} 
                onKeyDown={handleEnter}
                placeholder='Type here..'
                className='bg-gray-500 rounded-xl border-1 border-black px-2 py-1 h-16'
            ></textarea>


        </div>
    )
}