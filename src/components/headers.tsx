import Image from "next/image";
import Link from "next/link";
import tcdLogo from "public/tcd-logo.png";
import useTranslation from "src/lib/TextString";

export default function Home() {
    const text = useTranslation("Headers")
    var menuItem = [
        { text: text['home'], link: "/" },
        { text: text["login"], link: "/login" },
    ];

    return (
        <>
            <header className="px-1 py-5 w-3/4">
                <a href="https://www.tcd.ie/">
                    <Image
                        src={tcdLogo}
                        width={232}
                        height={62}
                        quality="100"
                        alt={text.logoDescription}
                    />
                </a>
            </header>
            <nav className="bg-accent text-white pt-5 w-full">
                <div className="px-1 mx-auto w-3/4">
                    <h2 className="text-3xl font-light">{text['title']}</h2>
                    <div className="flex">
                        {menuItem.map((item) => (
                            <Link
                                className="p-3 bg-accent hover:bg-accentHover -translate-x-3"
                                key={item.link}
                                href={item.link}
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
