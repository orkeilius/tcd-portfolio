import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect } from "react";

export default function Portfolio() {
    const { id, code } = useParams();

    async function join() {
        const { error } = await supabase.rpc("joinProject", {
            join_id: id,
            join_code: code,
        });
    };

    useEffect(() => {
        join();
    }, []);

    return (
        <main>
            <h2>redirecting ....</h2>
        </main>
    );
}
