import { forwardRef, useImperativeHandle, useState } from "react";

const ConfirmPopUp = forwardRef((props, ref) => {
    const [popUpData, setPopUpData] = useState({
        enable: false,
        text: null,
        onConfirm: null,
    });

    useImperativeHandle(ref, () => ({
        popUp(text, onConfirm) {
            setPopUpData({ enable: true, text: text, onConfirm: onConfirm });
        },
    }));

    return (
        <>
            <div
                className={
                    (!popUpData.enable && "scale-0 rounded-full ") +
                    " transition-all fixed w-screen h-screen opacity-25 bg-slate-500 top-0 left-0 z-10 flex"
                }
            />
            <div
                className={
                    (!popUpData.enable && "scale-0 ") +
                    " transition-all fixed top-1/2  -translate-x-1/2  -translate-y-1/2 z-10 left-1/2 bg-white w-56 p-3 rounded-xl m-auto opacity-100"
                }
            >
                <p className="font-bold mb-3 text-center">{popUpData.text}</p>
                <div className="flex justify-around">
                    <button
                        className="transition duration-300 text-white bg-gray-400 p-2 w-24 border-gray-400 border-2 rounded-2xl hover:bg-white hover:text-gray-400"
                        onClick={() =>
                            setPopUpData((popUpData) => {
                                return { ...popUpData, enable: false };
                            })
                        }
                    >
                        cancel
                    </button>
                    <button
                        onClick={() => {
                            popUpData.onConfirm.call();
                            setPopUpData((popUpData) => {
                                return { ...popUpData, enable: false };
                            });
                           
                        }}
                        className="transition duration-300 text-white bg-red-500 p-2 w-24 border-red-500 border-2 rounded-2xl hover:bg-white hover:text-red-500"
                    >
                        confirm
                    </button>
                </div>
            </div>
        </>
    );
});

export default ConfirmPopUp;
