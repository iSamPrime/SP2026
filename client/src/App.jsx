import { useEffect, useState } from 'react';
import Auth from './auth/auth.jsx'
import Home from './Home.jsx';

export default function App() {
  const [activeTap, setActiveTap] = useState("auth")
  const [mySession, setMySession] = useState(null)



  useEffect(() => {
    fetch("/session")
      .then(res => res.json())
      .then(res => {
        if(res.status === "Session"){
          setMySession(res.session);
          setActiveTap("Home")
        } else {
          setActiveTap("Auth")
        }
      })
      .catch(err => console.error("fetch error:", err));
  }, []);

  return (

    <>
      {
        activeTap === "Auth" ? 
        <Auth mySession={mySession} ></Auth>
        : (activeTap === "Home" ? 
          <Home mySession={mySession} ></Home>
          : 
          "App page error"
        )
      }
    </>
  )
}



