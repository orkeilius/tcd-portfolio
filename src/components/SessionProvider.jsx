import React from 'react'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const SessionContext = React.createContext();

export function SessionProvider({ children }) {
    const [session, setSession] = useState(null);
     
  
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
  
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
  }, [])
  

    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    )
}