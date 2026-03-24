import Auth from './auth/auth.jsx'
import Conv from './chat/conv.jsx';
import RoomSearch from './chat/RoomSearch.jsx';
import { useEffect, useState } from 'react';

export default function App({socketIo}) {
  const [mySession, setMySession] = useState(null)
  const [joinedRoom, setJoinedRoom] = useState(null)


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
      {joinedRoom ? 
        <Conv socketIo = {socketIo} mySession={mySession} roomId={joinedRoom} setJoinedRoom={setJoinedRoom}/>
      :
        <RoomSearch joinedRoom={joinedRoom} setJoinedRoom={setJoinedRoom} />
      }
      
    </>
  )
}
