import Auth from './auth/auth.jsx'
import Conv from './chat/conv.jsx';


function App({socketIo}) {


//../public/download.png




  return (
    <>
      <Auth></Auth>
      <Conv socketIo = {socketIo}/>

    </>
  )
}

export default App
