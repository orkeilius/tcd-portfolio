import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import ComponentMuseum from "./pages/ComponentMuseum";
import Portfolio from "./pages/Portfolio";
import SingUp from "./pages/SingUp"
import { SessionProvider } from "src/components/SessionProvider";
import 'react-toastify/dist/ReactToastify.css'

// import NoPage from "./pages/NoPage";

export default function App() {
    return (
        <SessionProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="/portfolio/:id" element={<Portfolio />} />
                        <Route path="/SingUp" element={<SingUp />} />

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