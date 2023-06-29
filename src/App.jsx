import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "src/components/SessionProvider";
import { lazy } from "react";
import Layout from "./pages/Layout";

// import NoPage from "./pages/NoPage";
const Home = lazy(() => import("./pages/Home"));
const Join = lazy(() => import("./pages/Join"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Project = lazy(() => import("./pages/Project"));
const SingUp = lazy(() => import("./pages/SingUp"));
const RecoverPassword = lazy(() => import("./pages/account/RecoverPassword"))
const ResetPassword = lazy(() => import("./pages/account/ResetPassword") )

export default function App() {
    return (
        <SessionProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="/portfolio/:id" element={<Portfolio />} />
                        <Route path="/join/:id/:code" element={<Join />} />
                        <Route path="/SingUp" element={<SingUp />} />
                        <Route path="/Project" element={<Project />} />
                        <Route path="/account/recover-password" element={<RecoverPassword />} />
                        <Route path="/account/reset-password" element={<ResetPassword />} />
                        {/* test page */}
                        {/* <Route path="*" element={<Home />} />  */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </SessionProvider>
    );
}