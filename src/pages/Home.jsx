import Project from "./Project" 
import { useContext } from "react";
import { SessionContext } from "src/components/SessionProvider";
import AdminPanel from "../components/AdminPanel";

export default function Home() {
  const session = useContext(SessionContext)
  return (
    <main>
      {session.role === 'admin' ?
        <AdminPanel/>  
        :
        <Project variation="home" />
      }
      </main>
  )
}
