import { IoHelpCircle } from "react-icons/io5";
import { SessionContext } from "src/components/SessionProvider";
import { supabase } from "src/lib/supabaseClient";
import { useEffect, useContext, useState, useRef } from "react";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";

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

    async function getProjectList() {
        const { error: funcError } = await supabase.rpc("deleteExpiredCodeApi");
        if (funcError) console.error(funcError);

        let { data, error } = await supabase
            .from("project")
            .select("*,project_code(*)")
            .order("id",{ascending:false});
        if (error) console.error(error);
        else setProjectList(data);
    }

    async function handleEdit(key, value, project) {
        const { error } = await supabase
            .from("project")
            .update({ [key]: value })
            .eq("id", project.id);

        if (error != null) console.error(error);

        setProjectList((list) =>
            list.map((i) => {
                if (i.id === project.id) {
                    return { ...i, [key]: value };
                } else {
                    return i;
                }
            })
        );
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
    }

    const [projectList, setProjectList] = useState([]);

    useEffect(() => {
        getProjectList();
    }, []);
    return (
        <main>
            <ConfirmPopUp ref={popUpRef} />
            <br />
            {session.role === "professor" && (
                <button
                    className="bg-accent hover:bg-white hover:text-accent border-accent border-2 transition-all duration-500  text-white rounded-lg py-1 px-2"
                    onClick={createProject}
                >
                    + Create a project
                </button>
            )}

            {projectList.map((project) => {
                return (
                    <div key={project.id}>
                        {session.role !== "professor" ? (
                            <h1 className="font-semibold text-3xl border-b border-black p-1">
                                {project.name}
                            </h1>
                        ) : (
                            <>
                                <input
                                    placeholder={text["title placeholder"]}
                                    className="font-semibold text-3xl border-b border-black p-1 w-full"
                                    value={project.name}
                                    onChange={(event) => {
                                        handleEdit(
                                            "name",
                                            event.target.value,
                                            project
                                        );
                                    }}
                                />
                                <div className="flex justify-between flex-wrap">
                                    {project.project_code?.code ===
                                    undefined ? (
                                        <button
                                            className="text-accent mr-1 underline"
                                            onClick={() => setCode(project)}
                                        >
                                            generate invite code
                                        </button>
                                    ) : (
                                        <div className="pl-1 flex items-center">
                                            <button
                                                className="text-accent mr-1 underline"
                                                onClick={() =>
                                                    copyLink(project)
                                                }
                                            >
                                                Copy invite link
                                            </button>
                                            <IoHelpCircle className="fill-slate-500" />
                                            <p className="text-sm">
                                                code expire after 12 hours
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
                                        delete project
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </main>
    );
}
