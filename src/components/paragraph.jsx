import { useEffect, useState, useRef } from "react";
import { supabase } from "src/lib/supabaseClient";
import useTranslation from "src/lib/TextString";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import DownloadList from "src/components/downloadList";

export default function Paragraph(props) {
    async function getParagraphData(portfolioId) {
        let { data, error } = await supabase
            .from("paragraph")
            .select("*")
            .eq("portfolio", portfolioId)
            .order("position");

        if (error != null) {
            console.error(error);
        }
        setParagraphData(data);
    }

    async function handleEdit(key, value, portfolioId, listPos) {
        setParagraphData((paragraphData) =>
            paragraphData.map((elem, index) => {
                return index !== listPos
                    ? elem
                    : {
                          ...elem,
                          [key]: value,
                      };
            })
        );

        const { error } = await supabase
            .from("paragraph")
            .update({ [key]: value })
            .eq("portfolio", portfolioId)
            .eq("position", paragraphData[listPos].position);
        if (error != null) console.error(error);
    }

    async function handleDelete(position, id) {
        const { error } = await supabase
            .from("paragraph")
            .delete()
            .eq("portfolio", id)
            .eq("position", position);

        if (error != null) console.error(error);
        getParagraphData(id);
    }

    async function createParagraph(id) {
        const { error } = await supabase.rpc("fn_createParagraph", {
            portfolio_id: id,
        });
        if (error != null) console.error(error);
        getParagraphData(id);
    }

    function resizeTextarea(event) {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    const text = useTranslation();
    const id = parseInt(props.id);
    const popUpRef = useRef(null);

    const [paragraphData, setParagraphData] = useState([]);

    useEffect(() => {
        getParagraphData(id);
    }, [id]);

    if (props.isAuthor) {
        setTimeout(() => {
            var textarea = Array.from(
                document.getElementsByTagName("textarea")
            );
            textarea.forEach((elem) => {
                elem.style.height = `${elem.scrollHeight}px`;
            });
        });
    }
    return (
        <>
            <ConfirmPopUp ref={popUpRef} />
            {paragraphData.map((paragraph, index) => {
                return (
                    <div key={paragraph.position} className="my-4">
                        {props.isAuthor ? (
                            <>
                                <input
                                    placeholder={text["subtitle placeholder"]}
                                    className="font-semibold text-xl p-1 w-full hover:bg-gray-100 rounded-lg"
                                    value={paragraph.title}
                                    onChange={(event) =>
                                        handleEdit(
                                            "title",
                                            event.target.value,
                                            id,
                                            index
                                        )
                                    }
                                />
                                <button
                                    className="block text-red-600 mr-1 ml-auto underline"
                                    onClick={() => {
                                        popUpRef.current.popUp(
                                            text["paragraph confirm"].replace(
                                                "{0}",
                                                paragraph.title
                                            ),
                                            () =>
                                                handleDelete(
                                                    paragraph.position,
                                                    id
                                                )
                                        );
                                    }}
                                >
                                    {text["delete paragraph"]}
                                </button>
                                <textarea
                                    id="area"
                                    placeholder={text["text placeholder"]}
                                    className="resize-none w-full m-1 hover:bg-gray-100 rounded-md p-1 "
                                    value={paragraph.text}
                                    onChange={(event) => {
                                        resizeTextarea(event);
                                        handleEdit(
                                            "text",
                                            event.target.value,
                                            id,
                                            index
                                        );
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="font-semibold text-xl p-1">
                                    {paragraph.title}
                                </h1>
                                <p className="p-2">{paragraph.text}</p>
                            </>
                        )}
                        {/* <div className="w-full border-b my-1 border-black" /> */}

                        <DownloadList isAuthor={props.isAuthor} id={paragraph.id} />
                    </div>
                );
            })}
            {props.isAuthor && (
                <button
                    className="my-10 mx-auto block w-1/2 bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-lg py-1 px-2"
                    onClick={() => createParagraph(id)}
                >
                    {text["create paragraph"]}
                </button>
            )}
        </>
    );
}
