

export default function Aform({email, pw}){




    return(
        <>
        <h2>{}Register</h2>
        <form action="/registering" method="post" className="">
            
            <div className="">
                <p>Email</p>
                <input 
                    type="email" placeholder="Email.." name="email"
                    onChange={(e)=>setEmail(e.target.value)} value={email}
                />
            </div>
            
            <div className="">
                <p>Password</p>
                <input 
                    type="password" name="pw" 
                    onChange={(e)=>setPW(e.target.value)} value={pw} 
                />
            </div>

            <button type="submit"
                    className="bg-gray-300 px-1 rounded-s border-2 border-black"        
            >Register</button>
        
        </form>
        
        </>
    )
} 