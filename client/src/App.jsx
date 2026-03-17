import Auth from './auth/auth.jsx'
import Conv from './chat/conv.jsx';
import { useEffect, useState } from 'react';

export default function App({socketIo}) {
  const [mySession, setMySession] = useState(null)

  useEffect(() => {
    fetch("/session")
      .then(res => res.json())
      .then(session => {
        setMySession(session);
      })
      .catch(err => console.error("fetch error:", err));
  }, []);


  return (

    <>
      
      <Auth mySession={mySession}></Auth>
      <Conv socketIo = {socketIo} mySession={mySession} roomId={"1"}/>

    </>

  )
}
