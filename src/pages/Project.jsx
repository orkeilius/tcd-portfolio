import { IoHelpCircle } from "react-icons/io5";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { useEffect, useContext, useState, useRef } from "react";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";
import UserList from "../components/userList";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

function generateCode() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789_-";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
}

export default function Project() {
    const text = useTranslation();
    const session = useContext(SessionContext);
    const popUpRef = useRef(null);
    const navigate = useNavigate();

    async function getProjectList() {
        const { error: funcError } = await supabase.rpc("deleteExpiredCodeApi");
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
        const { error } = await supabase.rpc("createProject");
        if (error != null) console.error(error);
        getProjectList();
    }
    async function createPortfolio(project_id) {
        const { data, error } = await supabase.rpc("createPortfolio", {
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
    }, [session])
    return (
        <main>
            <ConfirmPopUp ref={popUpRef} />
            <br />
            {session.role === "professor" && (
                <button
                    className="bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-lg py-1 px-2"
                    onClick={createProject}
                >
                    {text['create project']}
                </button>
            )}

            {projectList.map((project) => {
                return (
                    <div key={project.id} className="my-7">
                        {session.role !== "professor" ? (
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
                                        {text['create portfolio']}
                                    </button>
                                ) : (
                                    <div className="flex justify-center">
                                            <p>{text['my portfolio']}</p>
                                            <Link to={'/portfolio/' + userPortfolio[project.id].id} className="ml-1 text-accent underline" >
                                                {userPortfolio[project.id].title}
                                            </Link>
                                    </div>
                                )}
                            </>
                        ) : (
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
                                <div className="flex justify-between flex-wrap">
                                    {project.project_code?.code ===
                                    undefined ? (
                                        <button
                                            className="text-accent mr-1 underline"
                                            onClick={() => setCode(project)}
                                        >
                                            {text['create invite']}
                                        </button>
                                    ) : (
                                        <div className="pl-1 flex items-center">
                                            <button
                                                className="text-accent mr-1 underline"
                                                onClick={() =>
                                                    copyLink(project)
                                                }
                                            >
                                                {text['copy invite']}
                                            </button>
                                            <IoHelpCircle className="fill-slate-500" />
                                            <p className="text-sm">
                                            {text['invite expire']}
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        className="text-red-500 mr-1 underline"
                                        onClick={() => {
                                            popUpRef.current.popUp(
                                                text["file confirm"].replace(
                                                    "{0}",
                                                    project.name
                                                ),
                                                () =>
                                                    handleProjectDelete(project)
                                            );
                                        }}
                                    >
                                        {text['delete project']}
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
