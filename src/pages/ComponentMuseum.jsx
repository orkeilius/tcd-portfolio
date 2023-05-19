import React, { useState } from 'react';

import DownloadList from 'src/components/preset/downloadList'

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // A function that increment 👆🏻 the previous state like here 
    // is better than directly setting `setValue(value + 1)`
}


export default function Home() {

    const forceUpdate = useForceUpdate();

    return (
        <main>
            <h1 className='text-6xl'>museum of components</h1>
            <button className='bg-slate-400 p-4 rounded-full hover:bg-slate-500' onClick={forceUpdate}>re-render</button>
            
            <p>{Math.random()}</p>
            <DownloadList />

      </main>
    )
  }
  