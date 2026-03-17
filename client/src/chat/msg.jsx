

export default function Msg({msgs, mySession}){
    
    
    return(
        msgs?.map((p) => (
            <div key={p.id} 
                 className={`${(p?.sender === mySession?.email ) ? "bg-blue-100 justify-self-start" :  "bg-green-100" } 
                 w-9/10 min-h-10 rounded-xl
                 px-2 py-1
                 justify-self-end line-clamp-1000000000
                 `}
            > {console.log(p.email === mySession?.email, mySession?.email)}
                <div className="grid grid-cols-2 ">
                    <p className="text-xs justify-self-start text-red-500 ">{p.sender?.split("@")[0]}</p>
                    <p className="text-xs justify-self-end ">{p.id}</p>
                </div>
                <div className="">
                    <p className="">{p.text}</p>
                    {p.src ? <img src={p.src} alt={p.alt} /> : null}
                </div>
            </div>
        ))
    )
}