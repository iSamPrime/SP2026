import { useState } from "react"

export default function RoomSearch({socketIo, mySession}){
    
    const [ppl, setPpl] = useState([])




    return(<>

        <form action="" method="get">
            <h2>Enter room ID</h2>
            <input type="text" name="roomId"  />
            <button type="submit"></button>
        </form>

        <h2>Create room</h2>
        <p>Add user (Email): </p>
        <input type="email" placeholder="example@email.org" />

        {
            ppl.map((e)=>{
                <p>{e}</p>
            })

        }

        
        
    
    </>)


}