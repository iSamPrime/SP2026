import { useEffect, useState } from "react";
import EditMembers from "../chat/EditMembers.jsx";


export default function DashBoard ({socketIo}) {

    const [myRooms, setMyRooms] = useState([])


    useEffect(()=>{
        try{
            socketIo.emit("reqMyRooms", "")
            socketIo.on("resMyRooms", (myRooms)=>{
                setMyRooms(myRooms)
                console.log(myRooms)

            })
            
            return () => {
                socketIo.off("reqMyRooms"); 
                socketIo.off("resMyRooms");
            }
        } catch(err){
            console.log(err)
        }
    },[])

        
return(<>
    {
        myRooms.map((room)=>(
            <div key={room.roomId}>
                <h3>Room Name: {room.roomName}</h3>
                <p>Romm ID: {room.roomId}</p>
                <EditMembers room={room} socketIo={socketIo}/>
            </div>
        )) 
    }
</>)
}



