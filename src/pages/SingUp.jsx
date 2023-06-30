import { IoSync, IoCheckmarkCircle } from "react-icons/io5";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { useState } from "react";
import singup_bg from "src/image/singup-bg.jpg";
import useTranslation from "src/lib/TextString";
import ImageParallax from "../components/ImageParallax";

function InputEntry(props) {
    return (
        <input
            className="my-8 mx-auto p-1 outline-none bg-slate-200 block text-center focus-visible:border-accent2 rounded-md border-2"
            {...props}
            required
        />
    );
}

export default function SingUp() {
    const text = useTranslation();

    async function handleSingUp(event) {
        event.preventDefault();
        const args = event.target.elements;

        if (args.password.value !== args.password2.value) {
            toast.error(text["password mismatch"]);
            return;
        }
        setFormStatus("pending");

        const { data: existData, error: existError } = await supabase
            .rpc('fn_userExist', {
                arg_email : args.email.value 
            })

        if (existError) { 
            console.error(existError)
            toast.error(text["error"]);
            setFormStatus("edit");
            return
        }
        if (existData) { 
            toast.error(text["error account exist"]);
            setFormStatus("edit"); 
            return
        }

        let { error } = await supabase.auth.signUp({
            email: args.email.value,
            password: args.password.value,
            options: {
                data: {
                    firstName: args.firstName.value,
                    lastName: args.lastName.value,
                },
            },
        });

        if (error !== null) {
            console.error(error);
            toast.error(text["error"]);
            setFormStatus("edit");
        } else {
            setFormStatus("fulfilled");
        }
    }
    const [formStatus, setFormStatus] = useState("edit"); // edit | pending | fulfilled
    return (
        <main className="grid md:grid-cols-2 w-full h-full items-center">
            <div>
                <div className="mx-auto w-fit">
                    <div
                        className={
                            "transition-all overflow-hidden flex items-center justify-center " +
                            (formStatus === "fulfilled"
                                ? "max-h-[100px]"
                                : "max-h-0")
                        }
                    >
                        <IoCheckmarkCircle className="fill-green-700 mr-1 mt-[2.5px]" />
                        <p>{text["account created"]}</p>
                    </div>
                    <div
                        className={
                            "transition-all overflow-hidden flex items-center justify-center " +
                            (formStatus === "pending"
                                ? "max-h-[100px]"
                                : "max-h-0")
                        }
                    >
                        <IoSync className="infiniteRotate mr-2" />
                        <p>{text["loading"]}</p>
                    </div>
                </div>
                <form
                    onSubmit={handleSingUp}
                    className={
                        "transition-all duration-700 overflow-hidden h-full max-h-0 border rounded-lg m-2 " +
                        (formStatus === "edit"
                            ? "max-h-[550px] border-white"
                            : "max-h-0 border-black")
                    }
                >
                    <h1 className="text-6xl mb-16 text-center">{text["singUp"]}</h1>
                    <InputEntry
                        type="text"
                        placeholder={text["firstName"]}
                        name="firstName"
                        minLength="3"
                    />
                    <InputEntry
                        type="text"
                        name="lastName"
                        placeholder={text["lastName"]}
                        minLength="3"
                    />
                    <InputEntry type="email" name="email" placeholder="email" />
                    <InputEntry
                        type="password"
                        name="password"
                        placeholder={text["password"]}
                        minLength="8"
                    />
                    <InputEntry
                        type="password"
                        name="password2"
                        placeholder={text["password2"]}
                    />
                    <input
                        className=" relative my-8 mx-auto block text-center py-1 w-[193px] text-lg transition duration-500 text-white bg-accent rounded-md border-accent border-2 hover:bg-white hover:text-accent"
                        type="submit"
                        value={text["singUp"]}
                    />
                </form>
            </div>
            <ImageParallax
                alt=""
                src={singup_bg}
                className=" hidden md:block rounded-3xl w-full h-[80%] overflow-hidden"
            />
        </main>
    );
}
