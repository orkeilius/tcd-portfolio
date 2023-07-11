import { useContext, useState } from "react";
import useTranslation from "src/lib/TextString";
import { IoCaretForward } from "react-icons/io5";

export default function Home() {
    const text = useTranslation();
    const [open, setOpen] = useState("");
    return (
        <main>
            {Object.keys(text["help file"]).map((key, index) => {
                return (
                    <div key={index}>
                        <div
                            className="border-b m-0 flex py-2 items-center"
                            onClick={() => {
                                if (open === index) {
                                    setOpen(-1);
                                } else {
                                    setOpen(index);
                                }
                            }}
                        >
                            <IoCaretForward
                                className={
                                    "transition-all duration-700 aspect-square h-8 w-8 " +
                                    (open === index && "rotate-90")
                                }
                            />
                            <h2 className="font-light text-3xl text-slate-800 ">
                                {key}
                            </h2>
                        </div>
                        <div>
                            {text["help file"][key].map((paragraph, i) => {
                                return (
                                    <div key={i} className={"transition-all duration-700 overflow-hidden max-h-0 " + (open === index && "max-h-44")}>
                                        <h3 className="text-2xl text-accent mb-1">
                                            {paragraph.title}
                                        </h3>
                                        <p className="mb-5">{paragraph.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </main>
    );
}
