import { useState, useEffect, useContext, useCallback } from "react";
import { SessionContext } from "./SessionProvider";
import useTranslation from "src/lib/TextString";
import tcdLogo from "src/image/tcd-logo.png";
import Login from "src/components/login";
import { Link } from "react-router-dom";

export default function Home() {
    const text = useTranslation();
    const session = useContext(SessionContext);

    const getMenuItem= useCallback(() => {
        switch (session.role) {
            // case 'admin':
            case "student":
            case "professor":
                return [
                    { text: text["home"], link: "/" },
                    { text: text["project"], link: "/project" },
                    { text: text["help"], link: "/help", style:"ml-auto" }
                ];
            default:
                return [{ text: text["home"], link: "/" }];
        }
    },[session])
    const [menuItem, setMenuItem] = useState(getMenuItem(session));
    useEffect(() => { setMenuItem(getMenuItem()); }, [getMenuItem]);
    
    return (
        <>
            <header className="px-1 py-5 w-10/12 sm:w-3/4 flex justify-between items-center">
                <a href="https://www.tcd.ie/" className="mr-16">
                    <img
                        className="transition-all duration-0 max-h-[63px] hue-rotate-0 hover:hue-rotate-[3600deg] ease-linear hover:duration-[40s] hover:delay-[30s]"
                        src={tcdLogo}
                        alt={text['logo Description']}
                    />
                </a>
                <Login />
            </header>
            <nav className="bg-accent text-white pt-5 w-full h-f">
                <div className="px-1 pb-1 mx-auto w-3/4">
                    <h2 className="text-3xl font-light">{text["title"]}</h2>
                    <div className="flex mt-1">
                        {menuItem.map((item) => (
                            <Link
                                className={"transition-all p-3 bg-accent hover:bg-accentHover -translate-x-3 rounded-xl hover:scale-105 " + item.style}
                                key={item.link}
                                to={item.link}
                            >
                                {item.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}
