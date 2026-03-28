import { useState } from 'react';

export default function RoomSearch({ setJoinedRoom, setRoomName, roomName, socketIo}){
    
    const [createValue, setCreateValue] = useState('');
    const [joinValue, setJoinValue] = useState('');
    const [members, setMembers] = useState([]);


    const handleAddMember = (member) => {
      if (!members.includes(member)) {
        setMembers([...members, member]);
        setCreateValue('');
      }
    };

    const handleRemoveMember = (member) => {
      setMembers(members.filter(p => p !== member));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (createValue.trim()) {
                handleAddMember(createValue.trim());
            }
        } else if (e.key === 'Backspace' && !createValue && members.length > 0) {
            handleRemoveMember(members[members.length - 1]);
        }
    };

    const handleCreateRoom = () => {
        socketIo.emit("creRoom", { roomName: roomName, users: members })

        socketIo.on("crtdRoom",(room)=>{
            if(room.status === "Error"){
                alert(room.msg)
            } else if(room.status === "Success"){
                setRoomName(room.roomName)
                setJoinedRoom(room.roomId)
            }

        })
    

    };

return(
    <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-10">

            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                    Join Room
                </h2>
                <p className="text-sm text-gray-600 text-center">
                    Enter the room ID to join an existing room
                </p>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                        type="" 
                        placeholder="Enter room ID..." 
                        onChange={(e) => setJoinValue(e.target.value)}
                    />
                    <button 
                        className="max-w-20 bg-gray-800 text-white border-2 border-gray-800 rounded-lg py-3 px-4 font-medium hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 outline-none"
                        type="submit"
                        onClick={() => setJoinedRoom(joinValue.toString())}
                    >
                        Join
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                    Create Room
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">
                            Room Name
                        </p>
                        <input 
                            type="text" 
                            placeholder="Enter room name..." 
                            value={roomName} 
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all" 
                        />
                    </div>

                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">
                            Add Members (Email):
                        </p>
                        <div className="min-h-[3rem] px-3 py-2 border-2 rounded-lg bg-white border-gray-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200 flex flex-wrap gap-2 items-center transition-all">
                            {members.map((member) => (
                                <div
                                    key={member}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors group"
                                >
                                    <p className="text-sm font-medium text-slate-700">{member}</p>
                                    <button
                                        onClick={() => handleRemoveMember(member)}
                                        className="text-slate-400 hover:text-red-500 transition-colors font-semibold text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={createValue}
                                onChange={(e) => setCreateValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={members.length === 0 ? 'Type email and press Enter...' : ''}
                                className="flex-1 min-w-[12rem] outline-none bg-transparent text-slate-900 placeholder-slate-400 text-sm px-1"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gray-800 text-white border-2 border-gray-800 rounded-lg py-3 px-4 font-medium hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 outline-none" 
                        onClick={handleCreateRoom}
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    </div>)
}
