import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "src/components/SessionProvider";
import { Suspense, lazy } from "react";
import Layout from "./pages/Layout";

// import NoPage from "./pages/NoPage";
const Home = lazy(() => import("./pages/Home"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const SingUp = lazy(() => import("./pages/SingUp"));
const ComponentMuseum = lazy(() => import("./pages/ComponentMuseum"));

export default function App() {
    return (
        <SessionProvider>
            <BrowserRouter>
                
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route
                                path="/portfolio/:id"
                                element={<Portfolio />}
                            />
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
