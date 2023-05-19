import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";

import { SessionProvider } from "src/components/SessionProvider";

// import NoPage from "./pages/NoPage";

export default function App() {
    
    

    return (
        
        <SessionProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        {/* <Route path="test" element={<Test />} /> */}
                        {/* <Route path="*" element={<NoPage />} /> */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </SessionProvider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
