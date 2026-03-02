
export default function Msg({msgs}){



    return(
        msgs.map((p) => (
            <div key={p.id} 
                 className={` ${p.sender==="banana" ? "bg-blue-100 justify-self-start" : "bg-green-100 justify-self-end"} 
                 max-w-80 w-max min-h-10 rounded-xl
                 px-2 py-1
                 line-clamp-1000000000
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