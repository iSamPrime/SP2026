import { useState } from "react"
import Aform from "./aform"

export default function Auth(){
    
    const [email , setEmail] = useState(null)
    const [pw , setPW] = useState(null)

    const [onScreen, setOnScreen] = useState("login")

    const buttonCss = 
    `
        max-w-40 text-lg border-2 border-black rounded-lg 
        hover:bg-sky-400 
    `
    
    return(
        <>
            <div
                className="grid grid-cols-2 max-w-90 gap-2 py-2 px-2 border-2 border-red-500 rounded-lg"
            >
                <button 
                    className={`${buttonCss} ${onScreen === "register" ?  "" : (onScreen === "login" ?  "bg-sky-300" : "")}`}
                    onClick={()=>{if(!(onScreen==="login")){setOnScreen("login")}else{setOnScreen("unselected")}}}
                >
                    Login
                </button>
                <button 
                    className={`${buttonCss}  ${onScreen === "register" ?  "bg-sky-300" : (onScreen === "login" ?  "" : "")}`}
                    onClick={()=>{if(!(onScreen === "register")){setOnScreen("register")}else{setOnScreen("unselected")}}}
                >
                    Register
                </button>
            </div>
            {onScreen === "register" ? 
                <Aform id={"register"}
                    email={email} setEmail={setEmail} pw={pw} setPW={setPW}
                ></Aform>
            : (onScreen === "login" ? 
                <Aform id={"login"}
                    email={email} setEmail={setEmail} pw={pw} setPW={setPW}
                ></Aform> : "")
            }   
        </>
    )
} 
