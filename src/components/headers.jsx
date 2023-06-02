import { Link } from "react-router-dom";
import { SessionContext } from "./SessionProvider";
import { useState, useEffect, useContext, useCallback } from "react";
import Login from "src/components/login";
import tcdLogo from "src/image/tcd-logo.png";
import useTranslation from "src/lib/TextString";

export default function Home() {
    const text = useTranslation();
    const session = useContext(SessionContext);

    const getMenuItem = useCallback(() => {
        switch (session.role) {
            // case 'admin':
            case "student":
            case "professor":
                return [
                    { text: text["home"], link: "/" },
                    { text: text["project"], link: "/project" },
                ];
            default:
                return [{ text: text["home"], link: "/" }];
        }
    }, [session, text]);

    const [menuItem, setMenuItem] = useState(getMenuItem(session));
    useEffect(() => {
        setMenuItem(getMenuItem());
    }, [getMenuItem]);

    return (
        <>
            <header className="px-1 py-5 w-10/12 sm:w-3/4 flex justify-between items-center">
                <a href="https://www.tcd.ie/">
                    <img
                        className="max-h-[63px]"
                        src={tcdLogo}
                        alt={text["logo Description"]}
                    />
                </a>
                <Login />
            </header>
            <nav className="bg-accent text-white pt-5 w-full h-f">
                <div className="px-1 mx-auto w-3/4">
                    <h2 className="text-3xl font-light">{text["title"]}</h2>
                    <div className="flex">
                        {menuItem.map((item) => (
                            <Link
                                className="p-3 bg-accent hover:bg-accentHover -translate-x-3"
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
