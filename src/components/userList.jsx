import { useContext, useEffect, useRef, useState } from "react";
import { IoExitOutline } from "react-icons/io5";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { Link } from "react-router-dom";

export default function UserList(props) {
    const text = useTranslation();
    const session = useContext(SessionContext);
    const popUpRef = useRef(null);

    async function getUserData(project) {
        // Query file from db with props.postId
        let { data: userData, userError } = await supabase.rpc(
            "query_user_list",
            { query_project_id: props.projectId }
        );
        if (userError != null) console.error(userError);

        setUserList(userData);
    }

    const [userList, setUserList] = useState([]);

    const handleUserDelete = async (user_id) => {
        let { error } = await supabase.rpc("kickUserProject", {
            arg_project_id: props.projectId,
            arg_user_id: user_id,
        });

        if (error) console.error(error);

        getUserData();
    };

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <>
            <ConfirmPopUp ref={popUpRef} />
            <ul className="mx-auto my-1 border rounded-xl border-gray-500 border-separate w-[97%] overflow-hidden">
                {userList.map((user) => (
                    <li
                        key={user.first_name + user.last_name}
                        className="w-full flex justify-between border-b border-gray-500 last:border-0"
                    >
                        <p className="ml-1 font-semibold">
                            {user.first_name + " " + user.last_name}
                        </p>
                        {user.portfolio_id !== null && (
                            <Link
                                to={"/portfolio/" + user.portfolio_id}
                                className="underline text-accent hover:text-accent2"
                            >
                                {user.title}
                            </Link>
                        )}
                        {session.role === "professor" &&
                        session.id !== user.user_id ? (
                            <button
                                className="transition-all bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-6 h-6 m-2 md:m-1 md:w-5 md:h-5"
                                aria-label={text["button kick"]}
                                onClick={() => {
                                    popUpRef.current.popUp(
                                        text["user confirm"].replace(
                                            "{0}",
                                            user.first_name +
                                                " " +
                                                user.last_name
                                        ),
                                        () => handleUserDelete(user.user_id)
                                    );
                                }}
                            >
                                <IoExitOutline />
                            </button>
                        ) : (
                            <div className="h-[28px] " />
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
