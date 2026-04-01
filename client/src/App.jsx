import { useEffect, useState } from 'react';
import Auth from './components/auth/auth.jsx'
import Home from './components/Home/Home.jsx';

export default function App() {
  const [activeTap, setActiveTap] = useState(1)
  const [mySession, setMySession] = useState(null)



  useEffect(() => {
    fetch("/session")
      .then(res => res.json())
      .then(res => {
        if(res.status === "Session"){
          setMySession(res.session);
          setActiveTap(1)
        } else {
          setActiveTap(0)
        }
      })
      .catch(err => console.error("fetch error:", err));
  }, []);

  return (<>
    {
      activeTap === 0 ? 
      <Auth mySession={mySession} ></Auth>
      : (activeTap > 0  ? 
        <Home mySession={mySession} activeTap={activeTap} setActiveTap={setActiveTap}></Home>
        : 
        "App page error"
      )
    }
  </>)
}



