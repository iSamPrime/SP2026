import { useState, useEffect} from "react"


export default function Msg({msgs, mySession}){
    



    return (
        <div className={`flex flex-col`}>
            {msgs?.map((m, i) => {
                const lastMsgSender = i > 0 && msgs[i-1]?.msg_user_id === mySession.userId;
                return (
                    <div key={m.msg_id} 
                        className={`
                            ${(m?.user_id === mySession?.userId ) ? "bg-blue-100 self-start" :  "bg-green-100 self-end" } 
                            max-w-[90%] min-h-10 rounded-xl px-2 py-1 line-clamp-1000000000
                            ${lastMsgSender ? 'mt-1' : 'mt-4'}
                        `}
                    > 
                        <div className="grid grid-cols-2 ">
                            <p className="text-xs justify-self-start text-red-500 ">{m.user_name}</p>
                            <p className="text-xs justify-self-end ">{m.created_at}</p>
                        </div>
                        <div className="">
                            <p className="">{m.msg_content}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
