import Msg from './msg.jsx';
import { useState, useRef, useEffect} from 'react';
import { io } from 'socket.io-client'


export default function Conv(){
    const socketRef = useRef(null);

    useEffect(()=>{
        socketRef.current = io();
        socketRef.current.on("connect", () => {
            console.log(socketRef.current.id); 
            socketRef.current.on("msgback", (msg)=>{
                if(socketRef.current.connected){
                    setMsgs(prev => [...prev, msg])
                }
    })
        })
    }, [])





    const [msgs, setMsgs] = useState([{id: 1, sender:"banana", time: 12, text: " gggggggggggggg gggg ggggggggggggggggggggggggggggggggggggggggggggggggggggg iu hrei greig reh gruigh reghreu rugh orgh reh reouhg ore hroh ", src: "", alt: "GG"},
                {id: 2, sender:"GGgggggggggggg", time: 13,text: "gggggggggggggggggggggggggggggggggggggggggggggggg", src: "", alt: "GG"},
                {id: 3, sender:"Someone", time: 13, text: "gg", src: "", alt: "GG"},
                {id: 4, sender:"Isac", time: 13, text: "gg", src: "", alt: "GG"}
    ])




    const [theMsg, setTheMsg] = useState("")

    function handleEnter(e){
      if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            const text = theMsg.trim();

            // REMOVE THIS LINE LATER 
            console.log(text)

            if(!text) {alert("Empty message"); return}
        
            if(socketRef.current.connected){
                const msg = {id: 5, sender:"Banana", time: 14, text: text, src: "", alt: "GG"}
                socketRef.current.emit("msg", msg);
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