import "./globals.css";
import Header from "src/components/headers";
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
    
    return (
        <html lang="en">
            <body className={`${openSans.className} flex flex-col items-center`}>
                <Header/>
                <div className="px-1 w-3/4 overflow-clip">{children}</div>
            </body>
        </html>
    );
}
