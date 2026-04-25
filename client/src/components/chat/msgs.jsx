import { useState, useEffect} from "react"


export default function Msg({msgs, mySession}){
    



    return (
        <div className={`flex flex-col`}>
            {msgs?.map((m, i) => {
                const lastMsgSender = i > 0 && msgs[i-1]?.msg_user_id === msgs[i].msg_user_id;
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
                            <p className="text-xs justify-self-end text-gray-500">{m.created_at}</p>
                        </div>
                        
                        <p className="">{m.msg_content}</p>
                    
                    </div>
                )
            })}
        </div>
    )
}
