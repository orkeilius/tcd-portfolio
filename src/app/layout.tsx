import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import tcdLogo from "public/tcd-logo.png";
import { Open_Sans } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata = {
    title: "tcd portfolio",
    description: "tcd website to host portfolio",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    var menuItem = [
        { text: "Home", link: "/" },
        { text: "Login", link: "/login" },
    ];
    return (
        <html lang="en">
            <body className={openSans.className}>
                <header className="py-5 mx-auto max-w-screen-lg">
                    <a href="https://www.tcd.ie/">
                        <Image
                            src={tcdLogo}
                            width={232}
                            height={62}
                            quality="100"
                            alt="logo of the trinity colege"
                        />
                    </a>
                </header>
                <nav className="bg-accent text-white pt-5">
                    <div className="mx-auto max-w-screen-lg">
                        <h2 className="text-3xl font-light">Portfolio</h2>
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
                <section className="mx-auto max-w-screen-lg">{children}</section>
            </body>
        </html>
    );
}
