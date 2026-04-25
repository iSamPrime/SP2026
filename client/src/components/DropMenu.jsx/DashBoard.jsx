import { useEffect, useState } from "react";
import RoomEditor from "./RoomEditor";
import Title from "../Home/title";



export default function DashBoard ({socketIo, setActiveTap}) {

    const [myRooms, setMyRooms] = useState([]);

    useEffect(()=>{
        try{
            socketIo.emit("reqMyRooms", "")
            socketIo.on("resMyRooms", (resMyRooms)=>{
                setMyRooms(resMyRooms)
            })
            socketIo.on("removedAccess", (Id)=>{
                setMyRooms(prevRooms => prevRooms.filter((room)=> room.room_id !== Id))
            })
            return () => {
                socketIo.off("resMyRooms");
                socketIo.off("removedAccess");
            }
        } catch(err){
            console.log(err)
        }
    },[])

    
return(<>
    <Title 
        title="Dash Board"
        setActiveTap={setActiveTap}
        isRoom={false}
    />
    {myRooms.map((room)=>(
        <RoomEditor 
            socketIo={socketIo}
            key={room.room_id}
            room={room}
        />
        
    ))}
    {myRooms.length === 0 && <p>No rooms yet. Create one!</p>}
</>)
}



