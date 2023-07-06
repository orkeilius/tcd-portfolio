import { ConfirmPopUpContext } from "../components/ConfirmPopUp";
import { supabase } from "src/lib/supabaseClient";
import { useEffect, useState, useContext } from "react";
import DownloadList from "src/components/downloadList";
import useTranslation from "src/lib/TextString";
import { IoCaretDown, IoCaretUp, IoTrashBin } from "react-icons/io5";
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

    async function moveParagraph(paragraph, newPos) {
        const { error1 } = await supabase
            .from("paragraph")
            .update({ position: paragraph.position })
            .eq("position", newPos);
        if (error1 != null) {
            console.error(error1);
            return;
        }

        let { error2 } = await supabase
            .from("paragraph")
            .update({ position: newPos })
            .eq("id", paragraph.id);
        if (error2 != null) {
            console.error(error2);
            return;
        }
        getParagraphData(id)
    }

    function resizeTextarea(event) {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    const text = useTranslation();
    const id = parseInt(props.id);
    const setConfirmPopUp = useContext(ConfirmPopUpContext);

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
            {paragraphData.map((paragraph, index) => {
                return (
                    <div key={paragraph.id} className="my-4 transition-all">
                        {props.isAuthor ? (
                            <div className="group ">
                                <div className="w-0 h-0">
                                    <div className="group-hover:max-w-lg hover:overflow-visible  md:max-w-0 relative h-fit transition-all duration-500 w-fit -translate-x-[130%] overflow-clip ">
                                        {index != 0 && <IoCaretUp className="w-7 h-7 aspect-square mb-1 hover:scale-150 transition-all text-gray-500"
                                            onClick={() => {
                                                moveParagraph(
                                                    paragraph,
                                                    paragraph.position - 1
                                                );
                                            }}
                                        />}
                                        {index != paragraphData.length - 1 && <IoCaretDown
                                            className="w-7 h-7 aspect-square mb-1 hover:scale-150 transition-all text-gray-500"
                                            onClick={() => {
                                                moveParagraph(
                                                    paragraph,
                                                    paragraph.position + 1
                                                );
                                            }}
                                        />}
                                        <IoTrashBin
                                            className="w-7 h-7 aspect-square mb-1 hover:scale-150 transition-all text-red-600"
                                            title={text["delete paragraph"]}
                                            onClick={() => {
                                                setConfirmPopUp(
                                                    text[
                                                        "paragraph confirm"
                                                    ].replace(
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
                                        />
                                    </div>
                                </div>
                                <input
                                    placeholder={text["subtitle placeholder"]}
                                    className="font-semibold text-xl p-1 w-full hover:bg-gray-100 rounded-lg "
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
                                    className="block text-red-600 mr-1 underline w-full text-center sm:text-right"
                                    onClick={() => {
                                        setConfirmPopUp(
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
                                    className="resize-none w-full m-1 hover:bg-gray-100 rounded-md p-1 break-words "
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
                            </div>
                        ) : (
                            <>
                                <h1 className="font-semibold text-xl p-1 text-center sm:text-left">
                                    {paragraph.title}
                                </h1>
                                <p className="p-2 whitespace-pre-wrap break-words">
                                    {paragraph.text}
                                </p>
                            </>
                        )}
                        {/* <div className="w-full border-b my-1 border-black" /> */}

                        <DownloadList
                            isAuthor={props.isAuthor}
                            id={paragraph.id}
                        />
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
