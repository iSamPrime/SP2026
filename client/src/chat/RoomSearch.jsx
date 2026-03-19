import { useState, useRef, useEffect } from 'react';

export default function RoomSearch({socketIo, mySession}){
    
    const [inputValue, setInputValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const containerRef = useRef(null);
    const buttonCss = "bg-gray-300 px-1 rounded-s border-2 border-black max-w-20 content-center hover:bg-gray-400 "



    const memberSuggestions = [
      'Balham', 'Abbey Wood', 'Addington', 'Brunswick Park', 'Camberwell',
      'Clapham', 'Croydon', 'Ealing', 'Greenwich', 'Hammersmith'
    ]; //CHANGE



    const availableSuggestions = memberSuggestions.filter(memberList => 
        !members.includes(memberList) && memberList.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleAddMember = (member) => {
      if (!members.includes(member)) {
        setMembers([...members, member]);
        setInputValue('');
      }
      setIsDropdownOpen(false);
    };

    const handleRemoveMember = (member) => {
      setMembers(members.filter(p => p !== member));
    };

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setIsDropdownOpen(true);
    };

    const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim()) {
        handleAddMember(inputValue.trim());
        }
    } else if (e.key === 'Backspace' && !inputValue && members.length > 0) {
        handleRemoveMember(members[members.length - 1]);
    }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  


return(
    <div className="max-w-90 py-5 bg-white rounded-2xl shadow-lg space-y-6">
        <form action="/join" method="post" 
            className="grid grid-row-3 gap-4 m-2"
        >
            <h2 className="text-4xl justify-self-center">
                Enter room ID
            </h2>
            <p className="text-md" >Enter room ID</p>
            <div className="flex">
                
                <input 
                    className="w-full border-2 border-gray-600 rounded-lg p-1 text-sm focus:outline-sky-500"
                    type="number" memberholder="Enter room ID.." name="pw" 
                />
                <button className={buttonCss + " min-w-20 mx-2"} type='submit'>
                Join
                </button>
            </div>
        </form>

        <form action="create" method="post" className='mt-8'>
            <h2 className="text-4xl justify-self-center">
                Create room
            </h2>
            <div className="max-w-2xl mx-auto ">
            <p className="text-md px-2 py-2">Add users (Email): </p>
                {/* CREATE ROOM */}
                <div
                ref={containerRef}
                className="p-2 space-y-6"
                >

                    {/* ROOM Selector */}
                    
                    <div className='relative'>
                        {/* Tags Container */}
                        <div className="
                            min-h-12 px-1 py-1 border-2 rounded-lg
                            bg-white border-slate-200 
                            focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200
                            flex flex-wrap gap-2 items-center"
                        >
                            {members.map((member) => (
                                <div
                                    key={member}
                                    className="
                                    flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200
                                    bg-slate-100 hover:bg-slate-200 transition-colors group"
                                >
                                    <p className="text-sm font-medium text-slate-700">{member}</p>
                                    <button
                                        onClick={() => handleRemoveMember(member)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors font-semibold"
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder={members.length === 0 ? 'Type to add members...' : ''}
                                className="flex-1 min-w-40 outline-none bg-transparent text-slate-900 memberholder-slate-400 text-sm"
                            />
                            {/* Dropdown Suggestions */}
                            {isDropdownOpen && availableSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                            {availableSuggestions.map((member) => (
                                <button
                                key={member}
                                onClick={() => handleAddMember(member)}
                                className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors text-sm"
                                >
                                {member}
                                </button>
                            ))}
                            </div>
                        )}
                        </div>
                    </div>
                    <button type='submit' className={buttonCss}>
                        Create
                    </button>
                </div>
            </div>
        </form> 
    </div>)
}
