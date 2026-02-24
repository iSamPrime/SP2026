import Msg from './msg.jsx';
export default function Conv({msgs}){



    return(
        <div 
            className="grid max-w-100 
            bg-gray-600 border-2 border-black rounded-xl p-1
            gap-2"
        >
            <Msg msgs={msgs} />
            <textarea 
                type="text" defaultValue="GG" 
                className='bg-gray-500 rounded-xl border-1 border-black px-2 py-1 h-16'
            ></textarea>


        </div>
    )
}