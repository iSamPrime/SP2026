export default function Aform({ state, email, setEmail, pw, setPW, userName, setUserName}) {
    
    const inputStyle = "w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
    const pStyle = "block text-sm font-medium text-gray-700 mb-2"

    return (
        <form className="space-y-5" action={`/${state}`} method="POST">
            
            {state !== "Login" && 
                <div>
                    <p className={pStyle}>User name:</p>
                    <input 
                        type="text" 
                        name="userName"
                        required
                        placeholder="Your_unique_user_name"
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)}
                        className={inputStyle}
                    />
                </div>
            }

            <div>
                <p className={pStyle}>Email address:</p>
                <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle}
                />
            </div>

            <div>
                <p className={pStyle}>Password:</p>
                <input 
                    type="password" 
                    name="password"
                    required
                    placeholder="Password"
                    value={pw} 
                    onChange={(e) => setPW(e.target.value)}
                    className={inputStyle}
                />
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    className="w-full bg-gray-800 text-white border-2 border-gray-800 rounded-lg py-3 px-4 font-medium hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 outline-none"
                >
                    {state === "Login" ? "Sign In" : "Create Account"}
                </button>
            </div>
        </form>
    )
} 