import { useEffect, useState } from "react"
import Aform from "./aform"

export default function Auth(){
    
    const [email , setEmail] = useState(null)
    const [pw , setPW] = useState(null)

    const [onScreen, setOnScreen] = useState("login")
    function checkSession(){
        fetch("/session")
        .then(res=>res.json())
        .then(data => {
            if(data.loggedIn){
                setOnScreen("logout")
            } else {
                setOnScreen("login")
            }
        })
    }
    useEffect(checkSession, [])

    const buttonCss = `
        w-full text-lg border-2 border-black rounded-lg 
        hover:bg-sky-400 
    `

    return(
        <div
            className={`
                grid max-w-90 gap-2 py-2 px-2 border-2 border-red-500 rounded-lg 
                ${onScreen!="unselected" && onScreen!="logout" ? "auth-grid-area-form" : (onScreen!="logout"? "auth-grid-area" : " auth-grid-area-logout align-center"  ) }`}
        >
            {onScreen !=  "logout" ? 
                <>
                    <button 
                        className={`${buttonCss} ${onScreen === "login" &&  "bg-sky-300"} login-button`}
                        onClick={()=>{if(!(onScreen==="login")){setOnScreen("login")}else{setOnScreen("unselected")}}}
                    >
                        Login
                    </button>
                    <button 
                        className={`${buttonCss}  ${onScreen === "register" &&  "bg-sky-300"} register-button`}
                        onClick={()=>{if(!(onScreen === "register")){setOnScreen("register")}else{setOnScreen("unselected")}}}
                    >
                        Register
                    </button>
                </>
            : 
                (onScreen === "logout" &&
                    <form action="/logout">
                        <button className={`${buttonCss} logout-button`} type="submit">Logout</button>
                    </form>
                ) 
            }

            {onScreen === "register" ? 
                <Aform 
                    id={"register"} email={email} setEmail={setEmail} pw={pw} setPW={setPW}
                ></Aform>
            : 
                (onScreen === "login" && 
                    <Aform 
                        id={"login"} email={email} setEmail={setEmail} pw={pw} setPW={setPW}
                    ></Aform> 
                )
            } 
        </div>
    )
} 
