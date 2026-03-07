

export default function Msg({msgs, mySession}){


    return(
        msgs.map((p) => (
            <div key={p.id} 
                 className={` ${p.userId=== mySession?.userId ? "bg-blue-100 justify-self-start" : "bg-green-100 "} 
                 w-9/10 min-h-10 rounded-xl
                 px-2 py-1
                 justify-self-end line-clamp-1000000000
                 `}
            >
                <div className="grid grid-cols-2 ">
                    <p className="text-xs justify-self-start text-red-500 ">{p.sender}</p>
                    <p className="text-xs justify-self-end ">{p.time}</p>
                </div>
                <div className="">
                    <p className="">{p.text}</p>
                    {p.src ? <img src={p.src} alt={p.alt} /> : null}
                </div>
            </div>
        ))
    )
}