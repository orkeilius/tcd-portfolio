import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import ComponentMuseum from "./pages/ComponentMuseum";
import Portfolio from "./pages/Portfolio";

import { SessionProvider } from "src/components/SessionProvider";

// import NoPage from "./pages/NoPage";

export default function App() {
    
    

    return (
        
        <SessionProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="componentMuseum" element={<ComponentMuseum />} />
                        <Route path="/portfolio/:id" element={<Portfolio />} />
                        {/* <Route path="*" element={<Home />} />  */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </SessionProvider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
