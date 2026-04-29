


export default function Header ({navOpen, setNavOpen, Css, setActiveTap, activeTap, mySession}) {


return(
    <header 
        className={`
            flex items-center justify-between gap-4 px-4 py-3 
            border-b shadow-lg border-white/5
            bg-gradient-to-r from-black from-25%  via-50% to-sky-500 to-75%  
            ${
                navOpen && "via-white" || 
                (activeTap === 1 && "via-yellow-500 ") ||
                (activeTap === 21 && "via-green-500 ") ||
                (activeTap === 22 && "via-indigo-600 ") ||
                (activeTap === 23 && "via-purple-300 ") ||
                (activeTap === 24 && "via-red-500 ") 
            }
        `}
    >   
        <div className={Css.imgDiv}>
            <img className={Css.img} src="/wavechat.png" alt="Logo" />
        </div>

        <div className="flex-1" />


        <div 
            className="relative flex items-center gap-2 flex-shrink-0 bg-black/80 rounded-xl border border-white/10 hover:bg-white/10"   
            onMouseEnter={() => setNavOpen(true)}
            onMouseLeave={() => setNavOpen(false)}
        >
            <div className={Css.imgDiv}>
                <img className={Css.img} src="profileDef.jpg" alt="Profile picture" />
            </div>

            <p className="text-white">{mySession?.userName}</p>

            <div className="ml-5 pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="6" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                </svg>
            </div>

            {navOpen && (
                <>
                    <div className="absolute left-0 top-full w-full h-3" />
                    <div className="absolute left-0 top-full mt-3 w-full bg-slate-800 rounded-lg p-2 shadow-lg border border-white/5 z-20">
                        <nav  className="flex flex-col gap-2" onClick={()=> setNavOpen(false)}>
                            <button className={Css.buttonNav} onClick={() => setActiveTap(21)} >Profile</button>
                            <button className={Css.buttonNav} onClick={() => setActiveTap(22)} >Dash board</button>
                            <button className={Css.buttonNav} onClick={() => setActiveTap(24 )} >Log out</button>
                        </nav>
                    </div>
                </>
            )}
        </div>

    </header>
)} 