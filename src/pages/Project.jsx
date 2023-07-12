import { IoHelpCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { toast } from "react-toastify";
import { useEffect, useContext, useState } from "react";
import UserList from "../components/userList";
import useTranslation from "src/lib/TextString";
import { ConfirmPopUpContext } from "../components/ConfirmPopUp";
import PortfolioResume from "../components/PortfolioResume";
import { Link } from "react-router-dom";
import { IoDownload, IoTrashBin } from "react-icons/io5";

function generateCode() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789_-";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
}

export default function Project(props) {
    const text = useTranslation();
    const session = useContext(SessionContext);
    const setConfirmPopUp = useContext(ConfirmPopUpContext);
    const navigate = useNavigate();

    async function getProjectList() {
        const { error: funcError } = await supabase.rpc("fn_deleteExpiredCode");
        if (funcError) console.error(funcError);

        let { data, error } = await supabase
            .from("project")
            .select("*,project_code(*)")
            .order("id", { ascending: false });
        if (error) console.error(error);
        else setProjectList(data);
    }
    async function getUserPortfolio() {
        let { data, error } = await supabase
            .from("portfolio")
            .select("*")
            .eq("student_id", session.id);
        if (error) console.error(error);
        else {
            data = Object.assign(
                {},
                ...data.map((row) => {
                    return { [row.project_id]: { ...row } };
                })
            );
            setUserPortfolio(data);
        }
    }

    async function handleEdit(key, value, project) {
        setProjectList((list) =>
            list.map((i) => {
                if (i.id === project.id) {
                    return { ...i, [key]: value };
                } else {
                    return i;
                }
            })
        );

        const { error } = await supabase
            .from("project")
            .update({ [key]: value })
            .eq("id", project.id);

        if (error != null) console.error(error);
    }
    const handleProjectDelete = async (project) => {
        const { error } = await supabase
            .from("project")
            .delete()
            .eq("id", project.id);

        if (error != null) console.error(error);
        getProjectList();
    };

    async function createProject() {
        const { error } = await supabase.rpc("fn_createProject");
        if (error != null) console.error(error);
        getProjectList();
    }
    async function createPortfolio(project_id) {
        const { data, error } = await supabase.rpc("fn_createPortfolio", {
            arg_project_id: project_id,
        });
        if (error != null) console.error(error);
        else navigate("/portfolio/" + data);
    }

    async function setCode(project) {
        const code = generateCode();
        let expire = new Date(Date.now());
        expire.setHours(expire.getHours() + 12);

        const { error } = await supabase.from("project_code").upsert({
            id: project.id,
            code: code,
            expire: expire.toISOString(),
        });

        if (error != null) console.error(error);
        getProjectList();
    }

    function copyLink(project) {
        let link = `${import.meta.env.VITE_BASE_URL}/join/${project.id}/${
            project.project_code.code
        }`;
        navigator.clipboard.writeText(link);
        toast.success("copied !", { autoClose: 750 });
    }

    function resizeTextarea(event) {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    const [projectList, setProjectList] = useState([]);
    const [userPortfolio, setUserPortfolio] = useState([]);

    useEffect(() => {
        getProjectList();
        if (session.role === "student") {
            getUserPortfolio();
        }
    }, [session]);

    if (session.role === "professor") {
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
        <main>
            {session.role === "professor" && (
                <button
                    className="bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500 text-white rounded-lg py-1 px-2"
                    onClick={createProject}
                >
                    {text["create project"]}
                </button>
            )}
            {session.role === "student" && projectList.length === 0 && (
                <p className="text-center">{text["no project"]}</p>
            )}
            {session.role === undefined && (
                <p className="text-center">{text["project not connected"]}</p>
            )}

            {projectList.map((project) => {
                return (
                    <div key={project.id} className="mb-14 mt-5 last:mb-10 drop-shadow-xl bg-white rounded-3xl p-4 ">
                        {session.role === "student" && (
                            <>
                                <h1 className="font-semibold text-3xl border-b border-black p-1">
                                    {project.name}
                                </h1>
                                <p className="p-2 whitespace-pre-wrap break-words">
                                    {project.description}
                                </p>
                                {userPortfolio[project.id] === undefined ? (
                                    <button
                                        className="my-2 mx-auto block bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-lg py-1 px-2"
                                        onClick={() =>
                                            createPortfolio(project.id)
                                        }
                                    >
                                        {text["create portfolio"]}
                                    </button>
                                ) : (
                                    <div className="p-1">
                                        {props.variation !== "home" && (
                                            <UserList projectId={project.id} />
                                        )}
                                        <p className="my-2">
                                            {text["my portfolio"]}
                                        </p>
                                        <PortfolioResume
                                            id={userPortfolio[project.id].id}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        {session.role === "professor" && (
                            <>
                                <input
                                    placeholder={text["title placeholder"]}
                                    className="font-semibold text-3xl p-1 w-full hover:bg-gray-100 rounded-xl outline-none focus:bg-gray-200 "
                                    value={project.name}
                                    onChange={(event) => {
                                        handleEdit(
                                            "name",
                                            event.target.value,
                                            project
                                        );
                                    }}
                                />
                                <div className="w-full border-b my-1 border-black" />
                                <div className="flex sm:flex-row justify-between flex-wrap">
                                    {project.project_code?.code ===
                                    undefined ? (
                                        <button
                                            className="text-accent mr-1 underline"
                                            onClick={() => setCode(project)}
                                        >
                                            {text["create invite"]}
                                        </button>
                                    ) : (
                                        <div className="pl-1 flex items-center justify-center">
                                            <button
                                                className="text-accent mr-1 underline"
                                                onClick={() =>
                                                    copyLink(project)
                                                }
                                            >
                                                {text["copy invite"]}
                                            </button>
                                            <IoHelpCircle
                                                className="fill-slate-500"
                                                title={text["invite expire"]}
                                            />
                                        </div>
                                    )}

                                    <Link
                                        to={"/download/project/" + project.id}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="aspect-square ml-auto"
                                    >
                                        <IoDownload
                                            className="w-7 h-7 sm:w-5 sm:h-5 aspect-square hover:scale-125"
                                            title={text["download project"]}
                                        />
                                    </Link>
                                    <IoTrashBin
                                        className="w-7 h-7 sm:w-5 sm:h-5 aspect-square hover:scale-125 text-red-700"
                                        title={text["delete project"]}
                                        onClick={() => {
                                            setConfirmPopUp(
                                                text["file confirm"].replace(
                                                    "{0}",
                                                    project.name
                                                ),
                                                () =>
                                                    handleProjectDelete(project)
                                            );
                                        }}
                                    />
                                    <textarea
                                        placeholder={text["text placeholder"]}
                                        className="resize-none w-full m-1 hover:bg-gray-100 rounded-md p-1 break-words outline-none focus:bg-gray-200 "
                                        value={project.description}
                                        onChange={(event) => {
                                            resizeTextarea(event);
                                            handleEdit(
                                                "description",
                                                event.target.value,
                                                project
                                            );
                                        }}
                                    />
                                </div>
                                <UserList projectId={project.id} />
                            </>
                        )}
                    </div>
                );
            })}
        </main>
    );
}
