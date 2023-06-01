import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "src/components/SessionProvider";
import ComponentMuseum from "./pages/ComponentMuseum";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Portfolio from "./pages/Portfolio";
import Project from "./pages/Project";
import SingUp from "./pages/SingUp";
import Join from "./pages/Join";

// import NoPage from "./pages/NoPage";

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
