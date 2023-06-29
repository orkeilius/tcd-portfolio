import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Headers from "../components/headers";
import { ToastContainer } from "react-toastify";
import { ConfirmPopUpProvider } from "../components/ConfirmPopUp";

const Layout = () => {
    return (
        <div className="flex flex-col items-center h-full">
            <ToastContainer
                position="top-center"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <ConfirmPopUpProvider>
                <Headers />
                <div className="px-1 py-4 w-3/4 flex-1 ">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </div>
            </ConfirmPopUpProvider>
        </div>
    );
};

export default Layout;
