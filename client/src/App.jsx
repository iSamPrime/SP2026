import Conv from './conv.jsx';


function App() {
  const msgs = [{id: 1, sender:"banana", time: 12, text: " gggggggggggggg gggg ggggggggggggggggggggggggggggggggggggggggggggggggggggg iu hrei greig reh gruigh reghreu rugh orgh reh reouhg ore hroh ", src: "", alt: "GG"},
                {id: 2, sender:"GGgggggggggggg", time: 13,text: "gggggggggggggggggggggggggggggggggggggggggggggggg", src: "", alt: "GG"},
                {id: 3, sender:"Someone", time: 13, text: "gg", src: "", alt: "GG"},
                {id: 4, sender:"Isac", time: 13, text: "gg", src: "", alt: "GG"}
  ]

//../public/download.png


  return (
    <>
      <Conv msgs={msgs}/>

    </>
  )
}

export default App
