import React, { useState } from "react";
import DownloadList from "src/components/preset/downloadList";
import Comment from "src/components/preset/comment";


export default function Home() {
    const [showComponent, setShowComponent] = useState(true);

    const ForceUpdate = () => {
        setShowComponent(false)
        setTimeout(() => { setShowComponent(true) } , 1)
        
    }

    return (
        <main>
            <h1 className="text-6xl">museum of components</h1>
            <button className='bg-slate-400 p-4 rounded-full hover:bg-slate-500' onClick={ForceUpdate}>re-render</button>
            {showComponent && (
                <div>
                    <p>{Math.random()}</p>
                    <Comment />
                    <DownloadList />
                </div>
            )}
        </main>
    );
}
