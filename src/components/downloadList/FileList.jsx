import { useState } from "react";
import { IoCloudDownloadOutline, IoTrashOutline } from "react-icons/io5";
import { downloadFileList } from "src/lib/downloader";
import useTranslation from "src/lib/TextString";

export default function FileList(props) {
    const [dropState, setDropState] = useState("none"); // none ¦ drag
    const text = useTranslation();
    const fileList = props.fileList
    const paragraphInfo = props.paragraphInfo
    const fileUtils = props.fileUtils
    const uploadStatus = props.uploadStatus

    
    if (!paragraphInfo.isAuthor && fileList.length === 0) {
        return <></>;
    }

    return (
        <>
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
                        {paragraphInfo.isAuthor && (
                            <button
                                onClick={() => fileUtils.handleDelete(file.name)}
                                className=" transition-all m-1 mr-0 bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                                aria-label={text["button delete"]}
                            >
                                <IoTrashOutline />
                            </button>
                        )}

                        <button
                            onClick={() => fileUtils.handleDownload(file.name)}
                            className="transition-all m-1 bg-accent2 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                            aria-label={text["button download"]}
                        >
                            <IoCloudDownloadOutline />
                        </button>
                    </li>
                ))}
                {paragraphInfo.isAuthor && (
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
                            fileUtils.handleUpload(event.dataTransfer.files);
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
                                    htmlFor={"file-upload-" + paragraphInfo.id}
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
                                    {text["drag and drop file"][0]}
                                    <span className="underline">
                                        {text["drag and drop file"][1]}
                                    </span>
                                </label>
                                <input
                                    onChange={(event) => {
                                        fileUtils.handleUpload(event.target.files);
                                    }}
                                    id={"file-upload-" + paragraphInfo.id}
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
                )}
            </ul>
            <button
                className="mx-3 underline"
                onClick={() => {
                    downloadFileList(paragraphInfo.id);
                }}
            >
                {text["download all"]}
            </button>
        </>
    );
}
