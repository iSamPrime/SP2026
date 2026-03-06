

export default function Aform({id, email, pw, setEmail, setPW}){

const inputCss = "border-2 border-gray-600 rounded-lg p-1 text-sm focus:outline-sky-500" 
const pCss = "text-md" 
const divCss = "grid "
 
    return(
        <div className="max-w-90 p-5">
            <h2 className="text-3xl">
                {id === "register" ? "Register" : (id  === "login" ? "Login" : "Afrom id error")}
            </h2>
            <form 
                action={id==="login" ? "/loggingin" : "/registering"} method="post" 
                className="grid grid-row-3 gap-4 m-2"
            >
                
                <div className={divCss}>
                    <p className={pCss}>Email</p>
                    <input 
                        className={inputCss}
                        type="email" placeholder="Email.." name="email"
                        onChange={(e)=>setEmail(e.target.value)} value={email}
                    />
                </div>
                
                <div className={divCss}>
                    <p className={pCss} >Password</p>
                    <input 
                        className={inputCss}
                        type="password" placeholder="Password.." name="pw" 
                        onChange={(e)=>setPW(e.target.value)} value={pw} 
                    />
                </div>

                <button type="submit"
                        className="bg-gray-300 px-1 rounded-s border-2 border-black max-w-20 content-center hover:bg-gray-400"        
                >{id === "register" ? "Register" : (id  === "login" ? "Login" : "Afrom id error")}</button>
            
            </form>
            
        </div>
    )
} 