import { useState, useEffect } from "react";
import AddMembers from "./AddMembers.jsx";

export default function EditMembers({room, socketIo}){

    const [members, setMembers] = useState([]);

    useEffect(() => {
        setMembers(room.members);
    }, []);

    function roomUpdater(){
        socketIo.emit("updateRoom", {roomId: room.roomId, newMembers: members})
    }


return (
    <div>
        <AddMembers members={members} setMembers={setMembers} />
        <button 
        
            onClick={roomUpdater} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
            Update Room 
        </button>
    </div>
)}