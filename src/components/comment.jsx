import { ConfirmPopUpContext } from "../components/ConfirmPopUp";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { useContext, useState, useEffect } from "react";
import ProfileImage from "./profileImage";
import useTranslation from "src/lib/TextString";

export default function Comment(props) {
    async function getCommentData() {
        // Query file from db with props.postId
        let { data, error } = await supabase
            .from("comment")
            .select("*,userInfo(*)")
            .eq("portfolio_id", props.id);

        if (error !== null) {
            console.error(error);
        } else {
            setCommentData(
                data.map((elem) => {
                    return {
                        firstName: elem.userInfo.first_name,
                        lastName: elem.userInfo.last_name,
                        text: elem.text,
                        authorId: elem.userInfo.id,
                    };
                })
            );
        }
    }

    async function handleEdit(key, value) {
        setCommentData((commentData) =>
            commentData.map((elem) => {
                return elem.authorId !== session.id
                    ? elem
                    : {
                          ...elem,
                          [key]: value,
                      };
            })
        );

        const { error } = await supabase
            .from("comment")
            .update({ [key]: value })
            .eq("portfolio_id", props.id)
            .eq("author_id", session.id);
        if (error != null) console.error(error);
    }
    async function handleDelete(position, id) {
        const { error } = await supabase
            .from("comment")
            .delete()
            .eq("portfolio_id", props.id)
            .eq("author_id", session.id);

        if (error != null) console.error(error);
        getCommentData();
    }

    async function createComment() {
        const { error } = await supabase.rpc("fn_createComment", {
            arg_portfolio_id: parseInt(props.id),
        });
        if (error != null) console.error(error);
        getCommentData();
    }

    const text = useTranslation();

    function resizeTextarea(event) {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    const setConfirmPopUp = useContext(ConfirmPopUpContext);
    const [commentData, setCommentData] = useState([]);
    const session = useContext(SessionContext);

    setTimeout(() => {
        var textarea = Array.from(document.getElementsByTagName("textarea"));
        textarea.forEach((elem) => {
            elem.style.height = `${elem.scrollHeight}px`;
        });
    });

    useEffect(() => {
        getCommentData();
    }, [props.id, session]);

    return (
        <>
            {commentData.map((comment) => {
                return (
                    <div
                        key={comment.authorId}
                        className="mx-auto my-2 border rounded-xl border-black border-separate w-[97%] p-2"
                    >
                        <div className="flex w-full">
                            <ProfileImage
                                firstName={comment.firstName}
                                lastName={comment.lastName}
                            />
                            <div className="ml-1">
                                <p className="font-light text-xs mt-1">
                                    {text["comment author"]}
                                </p>
                                <p className="font-semibold text-lg leading-4">
                                    {comment.firstName + " " + comment.lastName}
                                </p>
                            </div>
                            {comment.authorId === session.id && (
                                <p
                                    className="flex-grow text-right underline text-red-600 mt-1"
                                    onClick={() => {
                                        setConfirmPopUp(
                                            text["comment confirm"],
                                            () => handleDelete()
                                        );
                                    }}
                                >
                                    
                                    {text["delete comment"]}
                                </p>
                            )}
                        </div>
                        {comment.authorId === session.id ? (
                            <textarea
                                id="comment text"
                                placeholder={text["comment placeholder"]}
                                className="w-full resize-none"
                                value={comment.text}
                                onChange={(event) => {
                                    resizeTextarea(event);
                                    handleEdit("text", event.target.value);
                                }}
                            />
                        ) : (
                            <p>{comment.text}</p>
                        )}
                    </div>
                );
            })}
            {session.role === "professor" &&
                !commentData
                    .map((elem) => {
                        return elem.authorId;
                    })
                    .includes(session.id) && (
                    <button
                        className="bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-lg py-1 px-2"
                        onClick={createComment}
                    >
                        {text["create comment"]}
                    </button>
                )}
        </>
    );
}
