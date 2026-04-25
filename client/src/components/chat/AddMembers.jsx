import { useState } from "react";

export default function AddMembers({members, setMembers, css}){

    const [createValue, setCreateValue] = useState('');


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
    return(
    <div className={css?.container || ""}>
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
)}