import { useRef, useState, useEffect } from "react";
import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import useTranslation from "src/lib/TextString";
import { supabase } from "../lib/supabaseClient";

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

export default function DownloadList(props) {
    async function getImageData(paragraphId, fileList) {
        let list = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileExtention = file.name.substring(
                file.name.lastIndexOf(".") + 1
            );
            console.log(file.name, fileExtention);
            if (!imageExtensions.includes(fileExtention)) {
                continue;
            }

            const { data, error } = await supabase.storage
                .from("media")
                .download(`${paragraphId}/${file.name}`);
            if (error != null) {
                console.error(error);
                continue;
            }
            list.push({
                name: file.name,
                image: data,
            });
        }
        setImageList(list);
    }

    // async function handleFileDelete(name) {
    //     setFileList((fileList) => {
    //         return fileList.filter((line) => line.name !== name);
    //     });

    //     const { error } = await supabase.storage
    //         .from("media")
    //         .remove([`${props.id}/${name}`]);
    //     if (error != null) {
    //         console.error(error);
    //     }
    // }

    const text = useTranslation();
    const isAuthor = props.isAuthor;
    const popUpRef = useRef(null);
    const [pos, setPos] = useState(0);
    const [imageList, setImageList] = useState([]);
    useEffect(() => {
        getImageData(props.id, props.fileList);
    }, [props.id, props.fileList]);

    const imageCss = (index) => {
        if (index === pos) {
            return "";
        } else if (index < pos) {
            return "-translate-x-10 opacity-0";
        } else {
            return "translate-x-10 opacity-0";
        }
    };

    console.log(imageList, props.id);
    return (
        <>
            <ul className="relative m-auto border mb-8 overflow-hidden rounded-lg h-96">
                <div className="transition-all duration-500 absolute h-full w-full z-10 select-none opacity-0 hover:opacity-100">
                    <div className="absolute top-1/2 -translate-y-1/2 w-6 left-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 opacity-80"
                        onClick={() => { setPos(Math.max(0, pos - 1)) }}
                    >
                        <IoCaretBack />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 w-6 right-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 opacity-80"
                        onClick={() => { setPos(Math.min(imageList.length - 1, pos + 1)) }}
                    >
                        <IoCaretForward />
                    </div>
                </div>
                {imageList.map((image, index) => (
                    <li key={image.name} className={"absolute transition-all h-full w-full " + imageCss(index)}>
                        <img
                            className="m-auto px-2 h-[calc(100%-2em)] object-contain"
                            src={URL.createObjectURL(image.image)} alt=""
                        />
                        <p className="w-full pl-2 py-1 bg-slate-600 text-white">
                            {image.name}
                        </p>
                    </li>
                ))}
            </ul>
        </>
    );
}
