import { useState, useEffect, useContext } from "react";
import useTranslation from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";
import { SessionContext } from "./SessionProvider";
import ProfileImage from "./profileImage";

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
        await supabase.auth.signInWithPassword({
            email: inputs.email,
            password: inputs.password,
        });
    };

    if (session.isLogged) {
        return (
            <div className="flex flex-col">
                <button className="mt-2 px-1 rounded-md bg-boutton1 hover:bg-slate-300">
                    {text.setting}
                </button>
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
    const text = useTranslation();
    const session = useContext(SessionContext);

    const [userMetadata, setUserMetadata] = useState({});
    const [isHover, setIsHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const getUserMetadata = async() => {
            if (!session.isLogged) {
                return;
            }
            let { data, error } = await supabase
                .from("userMetadata")
                .select("user_firstName,user_lastName")
                .eq("user_id", session.id);

            if (error == null) {
                setUserMetadata(data[0]);
            } else {
                console.error(error);
            }
        }
        getUserMetadata();
 
    }, [session]);

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
                    <div className="mr-3">
                        <h3 className="font-bold">
                            {session.isLogged
                                ? `${userMetadata.user_firstName} ${userMetadata.user_lastName}`
                                : text["not connected"]}
                        </h3>
                        <p className="underline text-right">
                            {session.logged ? null : text["login"]}
                        </p>
                    </div>

                    {/* image place holder */}
                    {session.isLogged ? (
                        <ProfileImage
                            firstName={userMetadata.user_firstName}
                            lastName={userMetadata.user_lastName}
                        />
                    ) : (
                        <ProfileImage />
                    )}
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
