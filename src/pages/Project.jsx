import { downloadProject } from "../lib/downloader";
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
        let link = `${process.env.REACT_APP_BASE_URL}/join/${project.id}/${project.project_code.code}`;
        navigator.clipboard.writeText(link);
        toast.success("copied !", { autoClose: 750 });
    }

    const [projectList, setProjectList] = useState([]);
    const [userPortfolio, setUserPortfolio] = useState([]);

    useEffect(() => {
        getProjectList();
        if (session.role === "student") {
            getUserPortfolio();
        }
    }, [session]);
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
            {session.role === "student"  && projectList.length === 0 &&(
                <p className="text-center">{text["no project"]}</p>
            )}
            {session.role === undefined  && (
                <p className="text-center">{text["project not connected"]}</p>
            )}

            {projectList.map((project) => {
                return (
                    <div key={project.id} className="my-20 first:mt-10">
                        {session.role === "student" &&(
                            <>
                                <h1 className="font-semibold text-3xl border-b border-black p-1">
                                    {project.name}
                                </h1>
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
                                    <div>
                                        {props.variation !== "home" && <UserList projectId={project.id} />}
                                        <p className="my-2">{text["my portfolio"]}</p>
                                        <PortfolioResume id={userPortfolio[project.id].id} />
                                    </div>
                                )}
                            </>
                        )}
                        {session.role === "professor" && (
                            <>
                                <input
                                    placeholder={text["title placeholder"]}
                                    className="font-semibold text-3xl p-1 w-full hover:bg-gray-100 rounded-xl"
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
                                <div className="flex flex-col sm:flex-row justify-between flex-wrap">
                                    {project.project_code?.code ===
                                    undefined ? (
                                        <button
                                            className="text-accent mr-1 underline"
                                            onClick={() => setCode(project)}
                                        >
                                            {text["create invite"]}
                                        </button>
                                    ) : (
                                        <div className="pl-1 flex items-center">
                                            <button
                                                className="text-accent mr-1 underline"
                                                onClick={() =>
                                                    copyLink(project)
                                                }
                                            >
                                                {text["copy invite"]}
                                            </button>
                                            <IoHelpCircle className="fill-slate-500" />
                                            <p className="text-sm">
                                                {text["invite expire"]}
                                            </p>
                                        </div>
                                    )}
                                    
                                        <button
                                            className="underline mr-1 sm:ml-auto"
                                            onClick={() => {
                                                downloadProject(project.id);
                                            }}
                                        >
                                            {text["download project"]}
                                        </button>
                                        <button
                                            className="text-red-600 mr-1 underline"
                                            onClick={() => {
                                                setConfirmPopUp(
                                                    text[
                                                        "file confirm"
                                                    ].replace(
                                                        "{0}",
                                                        project.name
                                                    ),
                                                    () =>
                                                        handleProjectDelete(
                                                            project
                                                        )
                                                );
                                            }}
                                        >
                                            {text["delete project"]}
                                        </button>
                                   
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
