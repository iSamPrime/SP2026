import { useState, useEffect} from "react"


export default function Msg({msgs, mySession}){
    



    return (
        <div className={`flex flex-col`}>
            {msgs?.map((m, i) => {
                const lastMsgSender = i > 0 && msgs[i-1]?.sender === m.sender;
                return (
                    <div key={m.id} 
                        className={`
                            ${(m?.sender === mySession?.email ) ? "bg-blue-100 self-start" :  "bg-green-100 self-end" } 
                            max-w-[90%] min-h-10 rounded-xl px-2 py-1 line-clamp-1000000000
                            ${lastMsgSender ? 'mt-1' : 'mt-4'}
                        `}
                    > 
                        <div className="grid grid-cols-2 ">
                            <p className="text-xs justify-self-start text-red-500 ">{m.sender?.split("@")[0]}</p>
                            <p className="text-xs justify-self-end ">{m.id}</p>
                        </div>
                        <div className="">
                            <p className="">{m.text}</p>
                            {m.src ? <img src={m.src} alt={m.alt} className="mt-2 max-h-60 object-contain" /> : null}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
