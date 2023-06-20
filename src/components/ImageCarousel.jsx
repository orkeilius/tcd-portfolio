import { IoCaretBack, IoCaretForward, IoTrashOutline } from "react-icons/io5";
import { supabase } from "../lib/supabaseClient";
import { useRef, useState, useEffect } from "react";
import ConfirmPopUp from "src/components/ConfirmPopUp";
import useTranslation from "src/lib/TextString";

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

export default function ImageCarousel(props) {
    async function getImageData(paragraphId, fileList) {
        let list = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileExtention = file.name.substring(
                file.name.lastIndexOf(".") + 1
            );
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
        setPos((pos) => Math.min(pos, Math.max(0, list.length - 1)));
        setImageList(list);
    }

    async function handleFileDelete(name) {
        setImageList((fileList) => {
            return fileList.filter((line) => line.name !== name);
        });
        setPos((pos) => Math.min(pos, imageList.length - 2));

        const { error } = await supabase.storage
            .from("media")
            .remove([`${props.id}/${name}`]);
        if (error != null) {
            console.error(error);
        }
    }

    const [imageList, setImageList] = useState([]);
    const [pos, setPos] = useState(0);
    const popUpRef = useRef(null);
    const text = useTranslation();
    useEffect(() => {
        getImageData(props.id, props.fileList);
    }, [props.id, props.fileList]);

    const imageCss = (index) => {
        if (index === pos) {
            return "z-10";
        } else if (index < pos) {
            return "-translate-x-10 --z-10 opacity-0";
        } else {
            return "translate-x-10 --z-10 opacity-0 ";
        }
    };
    if (imageList.length === 0) {
        return null;
    }
    return (
        <>
            <ConfirmPopUp ref={popUpRef} />
            <div className="group mx-5 relative m-auto border mb-8 overflow-hidden rounded-lg h-96">
                {imageList.map((image, index) => (
                    <div
                        key={image.name}
                        className={
                            "absolute transition-all h-full w-full " +
                            imageCss(index)
                        }
                    >
                        <img
                            className="m-auto px-2 h-[calc(100%-2em)] object-contain"
                            src={URL.createObjectURL(image.image)}
                            alt=""
                        />
                        <p className="w-full pl-2 py-1 bg-slate-600 text-white flex justify-between">
                            {image.name}
                            {props.isAuthor && (
                                <button
                                    onClick={() => {
                                        popUpRef.current.popUp(
                                            text["file confirm"].replace(
                                                "{0}",
                                                image.name
                                            ),
                                            () => handleFileDelete(image.name)
                                        );
                                    }}
                                    className=" transition-all m-1 mr-1 bg-red-500 flex justify-center items-center rounded-md hover:scale-125 w-5 h-5"
                                    aria-label={text["button delete"]}
                                >
                                    <IoTrashOutline />
                                </button>
                            )}
                        </p>
                    </div>
                ))}
                <div className="transition-all duration-500 absolute h-full w-full select-none opacity-0 group-hover:opacity-100 ">
                    <div
                        className={
                            "transition-all absolute top-1/2 -translate-y-1/2 w-6 left-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 opacity-80 z-20 " +
                            (pos === 0 && "-translate-x-7")
                        }
                        onClick={() => {
                            setPos(Math.max(0, pos - 1));
                        }}
                    >
                        <IoCaretBack className=" pointer-events: none" />
                    </div>
                    <div
                        className={
                            "transition-all absolute top-1/2 -translate-y-1/2 w-6 right-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 opacity-80 z-20 " +
                            (pos === imageList.length - 1 && "translate-x-7")
                        }
                        onClick={() => {
                            setPos(Math.min(imageList.length - 1, pos + 1));
                        }}
                    >
                        <IoCaretForward className=" pointer-events: none" />
                    </div>
                </div>
            </div>
        </>
    );
}
