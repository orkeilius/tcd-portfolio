import { SessionContext } from "src/components/SessionProvider";
import { useEffect, useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import useTranslation from "src/lib/TextString";
import { useParams } from "react-router-dom";
import Comment from "src/components/comment";
import Paragraph from "../components/paragraph";
import { Link } from "react-router-dom";

export default function Portfolio(props) {
    async function getPortfolioData(portfolioId) {
        let { data, error } = await supabase
            .from("portfolio")
            .select("*,user_info!portfolio_student_id_fkey(*)")
            .eq("id", portfolioId);

        if (error != null || data.length === 0) {
            console.error(error);
        } else {
            return { ...data[0] };
        }
    }

    async function handleEdit(key, value, portfolioId) {
        setPortfolioData((commentData) => ({
            ...commentData,
            [key]: value,
        }));

        const { error } = await supabase
            .from("portfolio")
            .update({ [key]: value })
            .eq("id", portfolioId);

        if (error != null) console.error(error);
    }

    const text = useTranslation();
    const session = useContext(SessionContext);
    const { id } = useParams();

    const [portfolioData, setPortfolioData] = useState(null);

    useEffect(() => {
        getPortfolioData(id).then((res) => setPortfolioData(res));
    }, [id, session]);

    if (portfolioData == null) {
        return null;
    }

    const isAuthor = portfolioData.student_id === session.id;
    return (
        <main>
            <br />
            {isAuthor ? (
                <input
                    placeholder={text["title placeholder"]}
                    className="font-semibold text-3xl p-1 w-full hover:bg-gray-100 rounded-lg"
                    value={portfolioData.title}
                    onChange={(event) =>
                        handleEdit("title", event.target.value, id)
                    }
                />
            ) : (
                <h1 className="font-semibold text-3xl p-1 text-center sm:text-left">
                    {portfolioData.title}
                </h1>
            )}
            <div className="w-full border-b my-1 border-black" />
            <div className="flex flex-col sm:flex-row justify-between mb-4">
                <p className="font-thin mx-auto sm:ml-1">
                    {text["portfolio author"] +
                        " " +
                        portfolioData.user_info.first_name +
                        " " +
                        portfolioData.user_info.last_name}
                </p>
                <Link
                    to={"/download/portfolio/" + id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" underline"
                >
                    {text["download portfolio"]}
                </Link>
            </div>

            <Comment id={id} />
            <Paragraph id={id} isAuthor={isAuthor} />
        </main>
    );
}
