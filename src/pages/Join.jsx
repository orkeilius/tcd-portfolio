import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useContext } from "react";
import { SessionContext } from "src/components/SessionProvider";
import useTranslation from "src/lib/TextString";
import { toast } from "react-toastify";

export default function Portfolio() {
    const { id, code } = useParams();
    const session = useContext(SessionContext);
    const navigate = useNavigate()
    const text = useTranslation()

    async function join() {
        const { error } = await supabase.rpc("joinProject", {
            join_id: id,
            join_code: code,
        });
        if (error === null) {
            console.error(error);
            toast.error(text["error"])
            navigate("/")
        }
        else {
            navigate("/project")
        }
    };

    useEffect(() => {
        if (['student','professor'].includes(session.role)) {
            join();
        }

    }, [session.role]);

    return (
        <main>
            <h2 className="text-2xl my-5 text-center">
            {['student','professor'].includes(session.role) ?
                text['redirecting']
                    :
                text['join not connected']   
            }
            </h2>
        </main>
    );
}
