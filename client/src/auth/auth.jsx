import { useState } from "react"
import Aform from "./aform"

export default function Auth(){
    
    const [email , setEmail] = useState(null)
    const [pw , setPW] = useState(null)

    return(
        <>
            <Aform id={register}
                
                email={email} setEmail={setEmail} pw={pw} setPW={setPW}
            ></Aform>

            <Aform id={login}
                
                email={email} setEmail={setEmail} pw={pw} setPW={setPW}
            ></Aform>

        </>
    )
} 
