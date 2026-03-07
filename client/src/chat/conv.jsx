import Msg from './msg.jsx';
import { useState,  useEffect} from 'react';


export default function Conv({socketIo, mySession}){
    const date = new Date();
    
    useEffect(()=>{
        socketIo.on("connect", () => {
            console.log(socketIo.id); 
            socketIo.on("msgback", (msg)=>{
                if(socketIo.connected){
                    setMsgs(prev => [...prev, msg])
                }
            })
        })
    }, [])


    const [msgs, setMsgs] = useState([{id: 1, sender:"banana", time: "1.2", text: " gggggggggggggg gggg ggggggggggggggggggggggggggggggggggggggggggggggggggggg iu hrei greig reh gruigh reghreu rugh orgh reh reouhg ore hroh ", src: "", alt: "GG"},
                {id: 2, sender:"GGgggggggggggg", time: "1.3",text: "gggggggggggggggggggggggggggggggggggggggggggggggg", src: "", alt: "GG"},
                {id: 3, sender:"Someone", time: "1.3", text: "gg", src: "", alt: "GG"},
                {id: 4, sender:"Isac", time: "1.3", text: "gg", src: "", alt: "GG"}
    ]) //EDIT


    const [theMsg, setTheMsg] = useState("")

    function handleEnter(e){
      if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            const text = theMsg.trim();

            if(!text) {alert("Empty message"); return}
        
            if(socketIo.connected){
                const msg = {id: 5, userId: mySession.userId ,sender:mySession.email.split("@")[0], time: date, text: text, src: "", alt: "GG"}
                console.log(date) // REMOVE
                socketIo.emit("msg", msg);
                setTheMsg('');
            } else {
                alert("Connection lost!"); return;
            }
        } else return
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