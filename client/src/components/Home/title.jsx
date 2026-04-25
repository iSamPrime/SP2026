


export default function Title({title, setActiveTap, isRoom, joinedRoom, setJoinedRoom, roomId, socketIo}){

    function exitRoom(){
        if(!isRoom){
            setActiveTap(1)
        }
        if(isRoom){
            setJoinedRoom(null)
            if(joinedRoom){
                socketIo.emit("leave-room", roomId);
                setActiveTap(1)
                setJoinedRoom(false)

            }   
        }
    }

    return (
    <div className="flex justify-between items-center py-4">
        <p className="font-bold text-4xl">
            {title}
        </p>
        <button
            onClick={() => exitRoom()}
            aria-label="Leave room"
            className="text-slate-400 hover:text-red-500 transition-colors font-bold text-3xl leading-none"
        >
            ×
        </button>
    </div>  
    ) 
}