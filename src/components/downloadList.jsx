import { useRef, useState, useEffect } from "react";
import { IoCloudDownloadOutline, IoTrashOutline } from "react-icons/io5";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";


function octetToSiZe(nb) {
    const sizeName = ["b", "Kb", "Mb", "Gb", "Tb"];
    let e = 0;
    nb /= 1;
    while (nb >= 1000 && e <= sizeName.length) {
        nb /= 1000;
        e += 1;
    }
    return `${nb.toFixed(2)} ${sizeName[e]}`;
}

function download(target) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = target;
    a.target = "_blank"
    a.download = target;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export default function DownloadList(props) {
    async function getFileData(paragraphId) {
        const { data, error } = await supabase.storage
            .from("media")
            .list(paragraphId + "", {
                limit: 100,
                offset: 0,
                sortBy: { column: "name", order: "asc" },
            });
        if (error != null) {
            console.error(error);
            return;
        }

        setFileList(
            data.map((file) => {
                return {
                    name: file.name,
                    size: octetToSiZe(file.metadata?.size),
                    url: null,
                };
            })
        );
    }

    async function handleUpload(fileList) {
        for (let i = 0; i < fileList.length; i++) {
            const element = fileList[i];
            setUploadStatus({
                message: "uploading " + element.name,
                progress: (i / fileList.length) * 100,
            });
            const { error } = await supabase.storage
                .from("media")
                .upload(props.id + "/" + element.name, element, {
                    cacheControl: "3600",
                    upsert: false,
                });
            if (error != null) console.error(error);
        }
        setUploadStatus({
            message: null,
            progress: 0,
        });
        getFileData(props.id);
    }

    async function handleDownloadFile(name) {
        const { data, error } = await supabase.storage
            .from("media")
            .createSignedUrl(`${props.id}/${name}`, 3600);
        if (error != null) {
            console.error(error);
        }
        else {
            console.log(data)
            download(data.signedUrl)
        }
    }

    async function handleFileDelete(name) {
        setFileList((fileList) => {
            return fileList.filter((line) => line.name !== name);
        });

        const { error } = await supabase.storage
            .from("media")
            .remove([`${props.id}/${name}`]);
        if (error != null) {
            console.error(error);
        }
    }

    const text = useTranslation();
    const isAuthor = props.isAuthor;
    const popUpRef = useRef(null);
    const [fileList, setFileList] = useState([]);
    const [dropState, setDropState] = useState("none"); // none ¦ drag
    const [uploadStatus, setUploadStatus] = useState({
        message: null,
        progress: 0,
    });
    useEffect(() => {
        getFileData(props.id);
    }, [props.id]);
    return (
        <>
            <ConfirmPopUp ref={popUpRef} />
            <ul className="m-auto border rounded-xl border-black border-separate w-[97%] overflow-hidden">
                {fileList.map((file) => (
                    <li
                        key={file.name}
                        className="transition-all duration-70000 w-full flex border-black last:border-0 overflow-hidden border-b"
                    >
                        <p className="ml-1 mr-auto font-semibold">
                            {file.name}
                        </p>
                        <p className="a">{file.size}</p>
                        {isAuthor ? (
                            <button
                                onClick={() => {
                                    popUpRef.current.popUp(
                                        text["file confirm"].replace(
                                            "{0}",
                                            file.name
                                        ),
                                        () => handleFileDelete(file.name)
                                    );
                                }}
                                className=" transition-all m-1 mr-0 bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                            >
                                <IoTrashOutline />
                            </button>
                        ) : null}

                        <button
                            onClick={() => handleDownloadFile(file.name)}
                            className="transition-all m-1 bg-accent2 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                        >
                            <IoCloudDownloadOutline />
                        </button>
                    </li>
                ))}
                <li
                    onDragEnter={(event) => {
                        if (event.dataTransfer.types.includes("Files"))
                            setDropState("drag");
                    }}
                    onDragLeave={() => setDropState("none")}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDropState("none");
                        handleUpload(event.dataTransfer.files);
                    }}
                    className={
                        "transition-all w-full flex border-b border-black last:border-0 font-semibold justify-center " +
                        (dropState === "drag"
                            ? " h-20 bg-cyan-100"
                            : "h-10 bg-slate-200")
                    }
                >
                    {uploadStatus.message == null ? (
                        <>
                            <label
                                htmlFor="file-upload"
                                className={
                                    "custom-file-upload cursor-pointer m-auto " +
                                    (dropState === "drag" &&
                                        "pointer-events-none")
                                }
                                onDragEnter={(event) => {
                                    if (
                                        event.dataTransfer.types.includes(
                                            "Files"
                                        )
                                    )
                                        setDropState("drag");
                                }}
                                //onDragLeave={() => setDropState("none")}
                            >
                                {"drag and drop file or "}
                                <span className="underline">select a file</span>
                            </label>
                            <input
                                onChange={(event) =>
                                    handleUpload(event.target.files)
                                }
                                id="file-upload"
                                className="hidden"
                                type="file"
                                multiple
                            />
                        </>
                    ) : (
                        <div className="w-full text-center h-10">
                            <p className="h-9">{uploadStatus.message}</p>
                            <div
                                className="h-1 w-full transition-all duration-300 m-r-auto bg-accent"
                                style={{
                                    width: `${uploadStatus.progress}%`,
                                }}
                            ></div>
                        </div>
                    )}
                </li>
            </ul>
            {/* <a className="mx-3 underline" href="/">
                {text["download all"]}
            </a> */}
        </>
    );
}
