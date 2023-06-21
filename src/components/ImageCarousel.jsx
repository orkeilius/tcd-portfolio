import { IoCaretBack, IoCaretForward, IoTrashOutline } from "react-icons/io5";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect, useContext } from "react";
import { ConfirmPopUpContext } from "src/components/ConfirmPopUp";
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

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || Math.abs(touchStart - touchEnd) <= 50)
            return;

        const newPos = touchStart > touchEnd ? 1 : -1;
        setPos((pos) =>
            Math.max(0, Math.min(newPos + pos, imageList.length - 1))
        );
    };

    const [imageList, setImageList] = useState([]);
    const [pos, setPos] = useState(0);
    const setConfirmPopUp = useContext(ConfirmPopUpContext);
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
            <div
                className="group mx-5 relative m-auto border mb-8 overflow-hidden rounded-lg h-96"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
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
                                        setConfirmPopUp(
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
                <div className="absolute h-full w-full select-none z-20 pointer-events-none ">
                    <div
                        className={
                            "transition-all duration-500 absolute top-1/2 -translate-y-1/2 w-6 left-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 pointer-events-auto opacity-0 group-hover:opacity-80 " +
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
                            "transition-all duration-500 absolute top-1/2 -translate-y-1/2 w-6 right-0 rounded-lg h-20 flex items-center m-1 p-1 bg-slate-400 pointer-events-auto opacity-0 group-hover:opacity-80 " +
                            (pos === imageList.length - 1 && "translate-x-7")
                        }
                        onClick={() => {
                            setPos(Math.min(imageList.length - 1, pos + 1));
                        }}
                    >
                        <IoCaretForward className=" pointer-events: none" />
                    </div>
                    {imageList.length > 1 && (
                        <div className="transition-all duration-500 absolute bottom-[8%] left-1/2 -translate-x-1/2 pointer-events-auto opacity-90 md:opacity-0 group-hover:opacity-90 ">
                            <div
                                className="relative transition-all duration-700 flex p-1 translate-x-1/2"
                                style={{ left: pos * -0.75 - 1 + "em" }}
                            >
                                {imageList.map((_, i) => (
                                    <div
                                        key={i}
                                        className={
                                            "relative transition-all duration-700 h-2 rounded-full mr-1 last:mr-0 " +
                                            (pos === i
                                                ? "bg-slate-700 w-6"
                                                : "bg-slate-400 w-2")
                                        }
                                        onClick={() => setPos(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
