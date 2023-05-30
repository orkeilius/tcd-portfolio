import singup_bg from "src/image/singup-bg.jpg";

function InputEntry(props) {
    return (
        <input
            className="my-8 mx-auto p-1 outline-none bg-slate-200 block text-center focus-visible:border-accent2 rounded-md border-2"
            {...props}
            required
            // type='password'
        />
    );
}

function handleSingUp(event) {
    event.preventDefault() 
    const args = event.target.elements 

}


export default function Home() {
    return (
        <main className="grid md:grid-cols-2 w-full h-full items-center">
            <form onSubmit={handleSingUp}>
                <h1 className="text-7xl mb-16 text-center">Sing Up</h1>
                <InputEntry
                    type="text"
                    placeholder="firstName"
                    name="firstName"
                />
                <InputEntry
                    type="text"
                    name="lastName"
                    placeholder="lastName"
                />
                <InputEntry
                    type="email"
                    name="email"
                    placeholder="email"
                />
                <InputEntry
                    type="password"
                    name="password"
                    placeholder="password"
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
            <img
                alt=""
                src={singup_bg}
                className="bg-red-400 hidden md:block rounded-3xl object-cover w-full h-[80%]"
            />
        </main>
    );
}
