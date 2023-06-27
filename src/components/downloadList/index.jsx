import { ConfirmPopUpContext } from "src/components/ConfirmPopUp";
import { downloadFileList } from "src/lib/downloader";
import { supabase } from "src/lib/supabaseClient";
import { useState, useEffect, useContext } from "react";
import FileList from "./FileList";
import ImageCarousel from "./ImageCarousel";
import useTranslation from "src/lib/TextString";

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
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = target;
    a.target = "_blank";
    a.download = target;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const imageExtensions = [
    "apng",
    "avif",
    "bmp",
    "gif",
    "ico",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "tiff",
    "webp",
    "icon",
];

export default function Index(props) {
    const text = useTranslation();
    const setConfirmPopUp = useContext(ConfirmPopUpContext);
    const [fileList, setFileList] = useState([]);
    const [uploadStatus, setUploadStatus] = useState({
        message: null,
        progress: 0,
    });

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
                const fileExtention = file.name.substring(
                    file.name.lastIndexOf(".") + 1
                );

                return {
                    name: file.name,
                    size: octetToSiZe(file.metadata?.size),
                    url: null,
                    type: imageExtensions.includes(fileExtention)
                        ? "image"
                        : "file",
                };
            })
        );
    }

    async function handleUpload(fileList) {
        for (let i = 0; i < fileList.length; i++) {
            const element = fileList[i];
            setUploadStatus({
                message: text["uploading file"].replace("{0}", element.name),
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

    async function handleDownload(name) {
        const { data, error } = await supabase.storage
            .from("media")
            .createSignedUrl(`${props.id}/${name}`, 3600);
        if (error != null) {
            console.error(error);
        } else {
            download(data.signedUrl);
        }
    }

    async function handleDelete(name) {
        setConfirmPopUp(text["file confirm"].replace("{0}", name), async () => {
            setFileList((fileList) => {
                return fileList.filter((line) => line.name !== name);
            });

            const { error } = await supabase.storage
                .from("media")
                .remove([`${props.id}/${name}`]);
            if (error != null) {
                console.error(error);
            }
        });
    }

    useEffect(() => {
        getFileData(props.id);
    }, [props.id]);

    const fileUtils = { handleDelete, handleDownload, handleUpload };
    return (
        <>
            <ImageCarousel
                fileList={fileList.filter((file) => file.type === "image")}
                paragraphInfo={{ isAuthor: props.isAuthor, id: props.id }}
                fileUtils={fileUtils}
            />
            <FileList
                fileList={fileList.filter((file) => file.type === "file")}
                paragraphInfo={{ isAuthor: props.isAuthor, id: props.id }}
                fileUtils={fileUtils}
                uploadStatus={uploadStatus}
            />
            {fileList.length > 1 && (
                <button
                    className="mx-3 underline"
                    onClick={() => {
                        downloadFileList(props.id);
                    }}
                >
                    {text["download all"]}
                </button>
            )}
        </>
    );
}
