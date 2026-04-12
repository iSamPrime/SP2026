import { useEffect, useState } from "react"
import Aform from "./aform"

export default function Auth({ mySession }) {
    const [email, setEmail] = useState(null)
    const [pw, setPW] = useState(null)
    const [userName, setUserName] = useState(null)
    const [onScreen, setOnScreen] = useState("Login")

    useEffect(() => {
        if (!mySession) return;
        setOnScreen(mySession.loggedIn ? "Logout" : "Login");
    }, [mySession])


    const toggleButtonBase = "flex-1 text-lg font-medium border-2 py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-10">
                
                {onScreen !== "Logout" ? (
                    <>
                        <div className="flex gap-3">
                            <button 
                                className={`${toggleButtonBase} ${onScreen === "Login" 
                                    ? "bg-sky-500 text-white border-sky-500 focus:ring-sky-200" 
                                    : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"}`}
                                onClick={() => setOnScreen("Login")}
                            >
                                Login
                            </button>
                            <button 
                                className={`${toggleButtonBase} ${onScreen === "Register" 
                                    ? "bg-sky-500 text-white border-sky-500 focus:ring-sky-200" 
                                    : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"}`}
                                onClick={() => setOnScreen("Register")}
                            >
                                Register
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400 uppercase tracking-widest font-bold text-xs">
                                    {onScreen}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-semibold text-center text-gray-800">
                                    {onScreen === "register" ? "Create Account" : "Welcome Back"}
                                </h2>
                                <p className="text-sm text-gray-600 text-center">
                                    {onScreen === "register" ? "Enter your details to get started" : "Enter your credentials to continue"}
                                </p>
                            </div>

                            <Aform 
                                state={onScreen} 
                                email={email} 
                                setEmail={setEmail} 
                                pw={pw} 
                                setPW={setPW} 
                                userName={userName}
                                setUserName={setUserName}
                            />
                        </div>
                    </>
                ) : (
                    
                    <div className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-semibold text-gray-800">Sign Out</h2>
                            <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
                        </div>
                        <form action="/logout">
                            <button 
                                className="w-full bg-red-500 text-white border-2 border-red-500 rounded-lg py-3 px-4 font-medium hover:bg-red-600 transition-all focus:ring-2 focus:ring-red-200 outline-none"
                                type="submit"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}