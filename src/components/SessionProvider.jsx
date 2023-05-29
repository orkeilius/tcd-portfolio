import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const SessionContext = React.createContext();

async function makeSessionObject(rawSession) {
  if (rawSession == null) {
    return { isLogged: null };
  }

  let { data, error } = await supabase
    .from("userInfo")
    .select("id,role(role)")
    .eq("id", rawSession.user.id)
    .limit(1)
    .maybeSingle();

  if (error != null) {
    console.error(error);
  }
  return {
    isLogged: true,
    role : data?.role.role,
    id: rawSession.user.id,
  }

}

export function SessionProvider({ children }) {
  const [sessionObject, setSessionObject] = useState({ isLogged : false});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            makeSessionObject(session).then((res) => setSessionObject(res));
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          makeSessionObject(session).then((res) => setSessionObject(res));
        });
    }, []);

    return (
        <SessionContext.Provider value={sessionObject}>
            {children}
        </SessionContext.Provider>
    );
}
