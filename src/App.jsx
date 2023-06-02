import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "src/components/SessionProvider";
import { lazy } from "react";
import Layout from "./pages/Layout";

// import NoPage from "./pages/NoPage";
const ComponentMuseum = lazy(() => import("./pages/ComponentMuseum"));
const Home = lazy(() => import("./pages/Home"));
const Join = lazy(() => import("./pages/Join"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Project = lazy(() => import("./pages/Project"));
const SingUp = lazy(() => import("./pages/SingUp"));

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
                        {/* test page */}
                        <Route
                            path="componentMuseum"
                            element={<ComponentMuseum />}
                        />
                        {/* <Route path="*" element={<Home />} />  */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </SessionProvider>
    );
}