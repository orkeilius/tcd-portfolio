import { SessionContext } from "src/components/SessionProvider";
import { useEffect, useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import useTranslation from "src/lib/TextString";
import { useParams } from "react-router-dom";

import DownloadList from "src/components/preset/downloadList";
import Comment from "src/components/preset/comment";

export default function Portfolio(props) {
    
    async function getPortfolioData(portfolioId) {
        let { data, error } = await supabase
            .from("portfolio")
            .select("*,userMetadata(*)")
            .eq("id", portfolioId);

        if (error != null || data.length === 0) {
            console.error(error);
        }
        else {       
            return {...data[0],};
        }
    }

    async function handleEdit(key,value, portfolioId) {
        const { error } = await supabase
            .from("portfolio")
            .update({ [key]: value })
            .eq("id", portfolioId);

        if (error != null) console.error(error);

        setPortfolioData((commentData) => ({
            ...commentData,
            [key]: value,
        }));
    };

    const text = useTranslation();
    const session = useContext(SessionContext);
    const { id } = useParams();
    
    const [portfolioData, setPortfolioData] = useState(null);

    useEffect(() => {
        getPortfolioData(id).then((res) => setPortfolioData(res));
    }, [id]);

    if (portfolioData == null) {
        return null;
    }

    const isAuthor = portfolioData.student_id === session.id;
    if (isAuthor) {
        setTimeout(() => {
            var textarea = document.getElementById("area");
            textarea.style.height = `${textarea.scrollHeight}px`;
        });
    }

    return (
        <main>
            <br />
            {isAuthor ? (
                <input
                    placeholder={text["title placeholder"]}
                    className="font-semibold text-3xl border-b border-black p-1 w-full"
                    value={portfolioData.title}
                    onChange={(event) =>
                        handleEdit('name',event.target.value, id)
                    }
                />
            ) : (
                <h1 className="font-semibold text-3xl border-b border-black p-1">
                    {portfolioData.title}
                </h1>
            )}
            <p className="font-thin ml-1">
                {text["portfolio author"] +
                    " " +
                    portfolioData.userMetadata.firstName +
                    " " +
                    portfolioData.userMetadata.lastName}
            </p>
            {isAuthor ? (
                <textarea
                    id="area"
                    placeholder={text["text placeholder"]}
                    className="resize-none w-full m-1"
                    value={portfolioData.text}
                    onChange={(event) => handleEdit('text',event.target.value, id)}
                />
            ) : (
                <p className=" p-1">{portfolioData.text}</p>
            )}
            <DownloadList />
            <Comment />
        </main>
    );
}
