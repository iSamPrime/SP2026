import { useState, useEffect } from "react";
import AddMembers from "../chat/AddMembers";

export default function RoomEditor({ room, socketIo }) {
    const [members, setMembers] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");
    const [roomAdminEmail, setRoomAdminEmail] = useState(room?.admin?.user_email);

    useEffect(() => {
        if (!room) return;

        const members_emails = room.members?.map((r) => r.user_email) || [];
        setMembers(members_emails);
        setRoomName(room.room_name || "");
        setRoomDescription(room.room_description || "");
        setRoomAdminEmail(room.admin?.user_email || "");
    }, [room]);

    function roomUpdater(){
        const newRoomInfo = {
            roomId: room.room_id, 
            roomName: roomName,
            roomDescription: roomDescription,
            roomAdminEmail: roomAdminEmail,
            members: members
        }
        socketIo.emit("updateRoom", newRoomInfo)
    }

    useEffect(() => {
        const handleNewRoom = ({ newRoom, newMembers }) => {   
            if(newRoom){      
                setRoomName(newRoom.room_name);
                setRoomDescription(newRoom.room_description);
                setRoomAdminEmail(newRoom.admin.user_email)
            }
            setMembers(newMembers.map(m => m.user_email)); 
        };

        socketIo.on("newRoom", handleNewRoom);
        
        return () => socketIo.off("newRoom", handleNewRoom);  
    }, [socketIo]);

    function removeRoomAccess(){
        socketIo.emit("removeRoomAccess", room.room_id)
    }

    const css = {
        container: "p-1 m-2 border rounded-lg shadow-md bg-white",
        label: "block text-m font-medium text-gray-700",
        input: "min-w-[12rem] w-full min-h-[3rem] px-3 py-2 border-2 rounded-lg bg-white border-gray-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200 transition-all bg-transparent text-slate-900 placeholder-slate-400 text-sm px-1",
        button: "px-4 py-2 text-white rounded-lg transition-colors"
    }

return(
    <div className="my-6">
        <p className={css.label}>
            Room ID: {room.room_id}
        </p>

        <div className={css.container}>
            <p className={css.label}>Room Name:</p>
            <input 
                type="text" 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={"Room Name"}
                className={css.input}
            />
        </div>

        <div className={css.container}>
            <p className={css.label} >Room Description:</p>
            <input 
                type="text" 
                value={roomDescription} 
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder={"Room Description (Max 2000 Charactars)"}
                className={css.input}
            />
        </div>

        <div className={css.container}>
            <p className={css.label}>Admins Email: </p>
            <input 
                type="text" 
                value={roomAdminEmail} 
                onChange={(e) => setRoomAdminEmail(e.target.value)}
                placeholder={""}
                className={css.input}
            />
        </div>
        

        <AddMembers 
            members={members} 
            setMembers={setMembers} 
            css={css}
        /> 

        <div className="flex gap-2">
            <button 
                onClick={roomUpdater} 
                className={`bg-blue-500 hover:bg-blue-600 ${css.button}`}
            >
                Update room 
            </button>

            <button 
                onClick={removeRoomAccess} 
                className={`bg-red-500 hover:bg-red-600 ${css.button}`}
            >
                Remove my access 
            </button>
        </div>
    </div>
)}