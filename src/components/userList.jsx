import { ConfirmPopUpContext } from "../components/ConfirmPopUp";
import { IoExitOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { useContext, useEffect, useState } from "react";
import useTranslation from "src/lib/TextString";

export default function UserList(props) {
    function UserTable({ users }) {
        return (
            <ul className="mx-auto my-1 border rounded-xl border-gray-500 border-separate w-[97%] overflow-hidden">
                {users.map((user) => (
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
                                    setConfirmPopUp(
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
        );
    }
    const text = useTranslation();
    const session = useContext(SessionContext);
    const setConfirmPopUp = useContext(ConfirmPopUpContext);

    async function getUserData(project) {
        // Query file from db with props.postId
        let { data: userData, userError } = await supabase.rpc(
            "fn_queryUserList",
            { query_project_id: props.projectId }
        );
        if (userError != null) console.error(userError);
        setUserList(userData);
    }

    const [userList, setUserList] = useState([]);

    const handleUserDelete = async (user_id) => {
        let { error } = await supabase.rpc("fn_kickUser", {
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
            <h2 className="mt-4 ml-5 ">{text['professor']}</h2>
            <UserTable
                users={userList.filter(
                    (user) => user.user_role === "professor"
                )}
            />

            {userList.filter((user) => user.user_role === "student").length !==
                0 && (
                <>
                    <h2 className="mt-4 ml-5 ">{text['student']}</h2>
                    <UserTable
                        users={userList.filter(
                            (user) => user.user_role === "student"
                        )}
                    />
                </>
            )}
        </>
    );
}
