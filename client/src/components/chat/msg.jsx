import { useState} from "react"


export default function Msg({m, i, msgs, mySession, css, socketIo}){
    const [editing, setEditing] = useState(false)
    const [newText, setNewText] = useState(m.msg_content)
    const lastMsgSender = i > 0 && msgs[i-1]?.msg_user_id === msgs[i].msg_user_id;
    
    const toggleEditing = ()=>{
        if(!editing){
            setEditing(true)
        } else {
            setEditing(false)
        }
    }

    const deleteMsg = ()=>{
        try{

            if(socketIo.connected){
                const msg = {
                    msgId: m.msg_id,  
                    roomId: m.room_id, 
                }

                socketIo.emit("deleteMsg", msg );
                setEditing(false)
            } else {
                alert("Connection lost!"); return;
            }

        } catch(error) {
          console.log(error)
        }
    }    

    const handleEnter = (e)=>{
        try{
            if(e.key === 'Enter' && !e.shiftKey){
                e.preventDefault()
                const text = newText.trim();
                if(!text) {alert("Empty message"); return}

                if(socketIo.connected){
                    const msg = {
                        msgId: m.msg_id,  
                        roomId: m.room_id, 
                        text: text
                    }

                    socketIo.emit("editMsg", msg );
                    setEditing(false)
                } else {
                    alert("Connection lost!"); return;
                }

            } else return

        } catch(error) {
          console.log(error)
        }
    }    
return (       
    <div key={m.msg_id} 
        className={`
            ${(m?.msg_user_id === mySession?.userId ) ? "bg-blue-100 self-start" :  "bg-green-100 self-end" } 
            w-[80%] min-h-10 rounded-xl px-2 py-1 line-clamp-1000000000
            ${lastMsgSender ? 'mt-1' : 'mt-4'}

        `}
    >   
        
        <div className={!lastMsgSender && "grid grid-cols-2"}>
            {lastMsgSender ? '' : 
                <p className="text-xs justify-self-start text-red-500 ">{m.user_name}</p>
            }
            <div className="flex justify-self-end gap-2">
                {m?.msg_user_id === mySession?.userId && <>
                    
                    <svg 
                        onClick={toggleEditing}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>

                    <svg 
                        onClick={deleteMsg}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </>}      
                <p className="text-xs text-gray-500">{m.created_at}</p> 
            </div>
        </div>
        
        {editing ? 
            <div> 
                <textarea 
                    className={css.textarea}
                    value={newText}
                    onChange={(e)=>setNewText(e.target.value)}
                    onKeyDown={handleEnter}
                />
            </div>
         :
            <p className="">{m.msg_content}</p>
        }
        
    
    </div>    
)}
