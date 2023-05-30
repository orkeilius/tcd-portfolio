import { supabase } from "../lib/supabaseClient";
import singup_bg from "src/image/singup-bg.jpg";
import { toast } from "react-toastify";
import { useState } from "react";
import { IoSync, IoCheckmarkCircle } from "react-icons/io5";


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
    async function handleSingUp(event) {
        event.preventDefault();
        const args = event.target.elements;

        if (args.password.value !== args.password2.value) {
            toast.error("missmatching password");
            return;
        }
        setFormStatus("pending");

        const { error } = await supabase.auth.signUp({
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
            toast.error("an error occurred")
            setFormStatus("edit");
        }
        else {
            setFormStatus("fulfilled");
        }
    }
    const [formStatus, setFormStatus] = useState("edit"); // edit | pending | fulfilled
    console.log(formStatus)
    return (
        <main className="grid md:grid-cols-2 w-full h-full items-center">
            <div>
                <div className="mx-auto w-fit">
                <div className={"transition-all overflow-hidden flex items-center justify-center " + (formStatus === "fulfilled" ? "max-h-[100px]" : "max-h-0")}>
                        <IoCheckmarkCircle className="fill-green-700 mr-1 mt-[2.5px]" />
                        <p>account created - check your email</p>
                    </div>
                    <div className={"transition-all overflow-hidden flex items-center justify-center " + (formStatus === "pending" ? "max-h-[100px]" : "max-h-0")}>
                        <IoSync className="infiniteRotate mr-2" />
                        <p>loading</p>
                    </div>
                </div>
                <form onSubmit={handleSingUp} className={"transition-all duration-700 overflow-hidden h-full max-h-0 border rounded-lg m-2 " + (formStatus === "edit" ? "max-h-[550px] border-white" : "max-h-0 border-black")}>
                    <h1 className="text-6xl mb-16 text-center">Sing Up</h1>
                    <InputEntry
                        type="text"
                        placeholder="firstName"
                        name="firstName"
                        minlength="3"
                    />
                    <InputEntry
                        type="text"
                        name="lastName"
                        placeholder="lastName"
                        minlength="3"
                    />
                    <InputEntry type="email" name="email" placeholder="email" />
                    <InputEntry
                        type="password"
                        name="password"
                        placeholder="password"
                        minlength="8"
                    />
                    <InputEntry
                        type="password"
                        name="password2"
                        placeholder="confirm password"
                    />
                    <input
                        className=" relative my-8 mx-auto block text-center py-1 w-[193px] text-lg transition duration-500 text-white bg-accent rounded-md border-accent border-2 hover:bg-white hover:text-accent"
                        type="submit"
                        text="Sing Up"
                    />
                </form>
            </div>
            <img
                alt=""
                src={singup_bg}
                className=" hidden md:block rounded-3xl object-cover w-full h-[80%]"
            />
        </main>
    );
}