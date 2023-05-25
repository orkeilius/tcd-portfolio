import { useState, useEffect, useContext } from "react";
import { SessionContext } from "./SessionProvider";
import useTranslation from "src/lib/TextString";
import tcdLogo from "src/image/tcd-logo.png";
import Login from "src/components/login";

export default function Home() {
    const text = useTranslation();
    const session = useContext(SessionContext);

    const [menuItem, setMenuItem] = useState([
        { text: text["home"], link: "/" },
    ]);

    useEffect(() => {
        if (["student", "professor"].includes(session.role)) {
            setMenuItem([
                { text: text["home"], link: "/" },
                { text: text["project"], link: "project" },
            ]);
        }
    }, [session, text]);
    return (
        <>
            <header className="px-1 py-5 w-3/4 flex justify-between">
                <a href="https://www.tcd.ie/">
                    <img
                        src={tcdLogo}
                        width={232}
                        height={62}
                        alt={text.logoDescription}
                    />
                </a>
                <Login />
            </header>
            <nav className="bg-accent text-white pt-5 w-full">
                <div className="px-1 mx-auto w-3/4">
                    <h2 className="text-3xl font-light">{text["title"]}</h2>
                    <div className="flex">
                        {menuItem.map((item) => (
                            <a
                                className="p-3 bg-accent hover:bg-accentHover -translate-x-3"
                                key={item.link}
                                href={item.link}
                            >
                                {item.text}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}
