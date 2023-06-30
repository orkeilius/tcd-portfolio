import { useState, useEffect, useRef,useContext } from "react";
import useTranslation from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";
import { SessionContext } from "./SessionProvider";
import ProfileImage from "./profileImage";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function DropDownMenu() {
    const session = useContext(SessionContext);
    const text = useTranslation();

    const [inputs, setInputs] = useState({ firstName: "", lastName: "" });

    const handleChange = (event) => {
        const name = event.target.type;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        const {error} = await supabase.auth.signInWithPassword({
            email: inputs.email,
            password: inputs.password,
        });
        if (error != null) {
            console.error(error)
            toast.error(text['error login'])
        }
    };

    if (session.isLogged) {
        return (
            <div className="flex flex-col">
                {/* <button className="mt-2 px-1 rounded-md bg-boutton1 hover:bg-slate-300">
                    {text.setting}
                </button> */}
                <button
                    className="mt-1 px-1 rounded-md bg-boutton1 hover:bg-slate-300"
                    onClick={() => supabase.auth.signOut()}
                >
                    {text.logout}
                </button>
            </div>
        );
    } else {
        return (
            <>
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
                <Link to="/account/recover-password" className="block text-right w-full pr-2 text-accent hover:underline">{text["forgot password"]}</Link>
                <Link to="/singup" className="block text-right w-full pr-2 text-accent hover:underline">{text["create account"]}</Link>
            </>
        );
    }
}

export default function Login() {
    const text = useTranslation();
    const session = useContext(SessionContext);

    const [userInfo, setuserInfo] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const menuDom = useRef(null);

    useEffect(() => {
        const getuserInfo = async () => {
            if (!session.isLogged) {
                return;
            }
            let { data, error } = await supabase
                .from("userInfo")
                .select("*")
                .eq("id", session.id);

            if (error == null) {
                setuserInfo(data[0]);
            } else {
                console.error(error);
            }
        };
        getuserInfo();
    }, [session]);

    const handleClick = (event) => {
        setIsOpen(menuDom.current.contains( event.target ))
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    });

    return (
        <div className={"overflow-visible h-0 w-0 -translate-y-8 " } ref={menuDom}>
        <div
                className={
                    "overflow-y-hidden transition-all -translate-x-full duration-700 rounded-xl h-fit w-fit p-2 bg-white z-10 items-end justify-end  " +
                    (isOpen ? "shadow-2xl max-h-fit" : "sm:hover:bg-gray-100")
                }
            >
                <div className="flex flex-row justify-end">
                    <div className="mr-3 hidden sm:block ">
                        <h3 className="font-bold overflow-y-clip whitespace-nowrap">
                            {session.isLogged
                                ? `${userInfo.first_name} ${userInfo.last_name}`
                                : text["not connected"]}
                        </h3>
                        <p className="underline text-right">
                            {session.isLogged ? text["account setting"] : text["login"]}
                        </p>
                    </div>

                    {/* image place holder */}
                    {session.isLogged ? (
                        <ProfileImage
                            firstName={userInfo.first_name}
                            lastName={userInfo.last_name}
                        />
                    ) : (
                        <ProfileImage />
                    )}
                </div>
                <div
                    className={
                        "transition-all duration-700 overflow-hidden " +
                        (isOpen ? "max-h-96 max-w-7xl" : "max-h-0 max-w-0")
                    }
                >
                    <DropDownMenu />
                </div>
            </div>
        </div>
    );
}
