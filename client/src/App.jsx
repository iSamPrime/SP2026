import Auth from './auth/auth.jsx'
import Conv from './chat/conv.jsx';
import { useEffect, useState} from 'react';


function App({socketIo}) {
  const [session0, setSession0] = useState(null)

  useEffect(()=>{
    fetch("/session")
    .then(res=>res.json())
    .then(session=>setSession0(session));
    
  }, [])




  return (
    <>
      <Auth session0={session0}></Auth>
      <Conv socketIo = {socketIo} session0={session0}/>

    </>
  )
}

export default App
