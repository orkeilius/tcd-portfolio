import { faker } from "@faker-js/faker";
import { useRef, useState } from "react";
import { IoCloudDownloadOutline, IoTrashOutline } from "react-icons/io5";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";

function getFileData(portfolioId) {
    // Query file from db with props.postId

    //place holder
    var fileList = [];
    for (let index = 0; index < Math.round(Math.random() * 40); index++) {
        fileList.push({
            name: faker.system.fileName(),
            size: Math.round(Math.random() * 999),
            url: faker.image.url(),
        });
    }
    return fileList;
}

export default function DownloadList(props) {
    
    const text = useTranslation();

    //place holder
    const [isAuthor, setIsAuthor] = useState(true);
    const popUpRef = useRef(null);
    const [fileList, setFileList] = useState(getFileData);

    const handleFileDelete = (name) => {
        //call to db

        setFileList((fileList) => {return fileList.filter(line => line.name !== name)})
    }

    return (
        <>
            <button
                className="bg-green-300 mb-5"
                onClick={() => setIsAuthor(!isAuthor)}
            >
                dev : is author : {isAuthor ? "true" : "false"}
            </button>
            <ConfirmPopUp ref={popUpRef} />
            <ul className="m-auto border rounded-xl border-black border-separate w-[97%] overflow-hidden">
                {fileList.map((file) => (
                    <li className="w-full flex border-b border-black last:border-0">
                        <p className="ml-1 mr-auto font-semibold">
                            {file.name}
                        </p>
                        <p className="a">{file.size + "mo"}</p>
                        {isAuthor ? (
                            <button
                                onClick={() => { popUpRef.current.popUp(text["file confirm"].replace("${0}",file.name), () => handleFileDelete(file.name)) }}
                                className=" transition-all m-1 mr-0 bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                            >
                                <IoTrashOutline />
                            </button>
                        ) : null}

                        <a
                            href={file.url}
                            className=" transition-all m-1 bg-accent2 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                        >
                            <IoCloudDownloadOutline />
                        </a>
                    </li>
                ))}
            </ul>
            <a className="mx-3 underline" href="/" >{text["download all"]}</a>
        </>
    );
}
