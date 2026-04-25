import Title from "../Home/title"

export default function Profile ({setActiveTap}) {

return(<>
    <Title 
        title="Profile"
        setActiveTap={setActiveTap}
        isRoom={false}
    />

</>)
}