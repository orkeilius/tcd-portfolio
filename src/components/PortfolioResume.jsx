import { supabase } from "src/lib/supabaseClient";
import { useState, useEffect, useContext } from "react";
import useTranslation from "src/lib/TextString";
import { SessionContext } from "src/components/SessionProvider";
import { Link } from "react-router-dom";
import Comment from "./comment";

export default function PortfolioResume({ id }) {
    async function getPortfolioData(portfolioId) {
        let { data, error } = await supabase
            .from("portfolio")
            .select("*,userInfo!portfolio_student_id_fkey(*),project(*)")
            .eq("id", portfolioId);

        if (error != null || data.length === 0) {
            console.error(error);
        } else {
            return { ...data[0] };
        }
    }
    const [portfolioData, setPortfolioData] = useState(null);
    const session = useContext(SessionContext);
    const text = useTranslation();
    useEffect(() => {
        getPortfolioData(id).then((res) => setPortfolioData(res));
    }, [id, session]);

    console.table(portfolioData);
    if (portfolioData === null) {
        return;
    }
    return (
        <div className="bg-slate-100 rounded-2xl p-2 pt-3">
            <div className="flex justify-between">
                <div className="px-3">
                    <h2 className="text-2xl font-semibold underline">
                        {portfolioData.title}
                    </h2>
                    <p className="">{`${portfolioData.userInfo.first_name} ${portfolioData.userInfo.last_name} | ${portfolioData.project.name}`}</p>
                    
                </div>
                <Link
                    to={"/portfolio/" + portfolioData.id}
                    className="bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-xl py-1 px-2 h-max"
                >
                    {text["view portfolio"]}
                </Link>
            </div>
            <Comment id={id} variation="portfolioResume" />
        </div>
    );
}
