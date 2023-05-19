import { useState, useEffect, useContext } from "react";
import useTranslation from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";
import { SessionContext } from "./SessionProvider";

function DropDownMenu() {
    const session = useContext(SessionContext)
    const text = useTranslation("Login");

    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.type;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        await supabase.auth.signInWithPassword({
            email: inputs.email,
            password: inputs.password,
        });
    };

    if (session != null) {
        return (
            <div className="flex flex-col">
                <button className="mt-2 rounded-sm bg-boutton1 hover:bg-slate-300">{text.setting}</button> 
                <button className="mt-1 rounded-sm bg-boutton1 hover:bg-slate-300" onClick={() =>  supabase.auth.signOut() }>{text.logout}</button>
            </div>
        );
    } else {
        return (
            <form
                className="flex flex-col text-center mt-2"
                onSubmit={handleLogin}
            >
                <input
                    className="bg-slate-200 m-1 outline-none focus-visible:border-accent2 rounded-md border-2"
                    placeholder={text["email"]}
                    type="email"
                    onChange={handleChange}

                />

                <input
                    className="bg-slate-200 m-1 outline-none focus-visible:border-accent2 rounded-md border-2"
                    placeholder={text["password"]}
                    type="password"
                    onChange={handleChange}

                />
                <input
                    className="transition duration-500 m-1 text-white bg-accent rounded-md border-accent border-2 hover:bg-white hover:text-accent"
                    placeholder={text["login"]}
                    type="submit"
                />
            </form>
        );
    }
}

export default function Login() {
    const text = useTranslation("Login");
    const session = useContext(SessionContext)

    const [isHover, setIsHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(isHover);
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    });

    return (
        <div className="overflow-visible h-0">
            <div
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className={
                    "overflow-y-hidden transition-all duration-700 rounded-xl h-fit p-2 relative bg-white z-10 w-fit " +
                    (isOpen ? "shadow-2xl max-h-fit" : "hover:bg-gray-100 ")
                }
            >
                <div className="flex flex-row justify-end">
                    <div>
                        <h3 className="font-bold">
                            {session != null ? "errored" : text["not connected"]}
                        </h3>
                        <p className="underline text-right">{session != null ? null :text["login"]}</p>
                    </div>

                    {/* image place holder */}
                    <div className="bg-slate-500 rounded-full h-12 ml-3 aspect-square" />
                </div>
                <div
                    className={
                        "transition-all duration-700 overflow-hidden " +
                        (isOpen ? "max-h-96" : "max-h-0")
                    }
                >
                    <DropDownMenu />
                </div>
            </div>
        </div>
    );
}
