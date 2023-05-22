import React from "react";
import {Outlet} from "react-router-dom";
import Headers from "../components/headers";

const Layout = () => {
  return (
    <div className="flex flex-col items-center">
      
      <Headers />
      <div className="px-1 w-3/4">

      <Outlet />
      </div>
    </div>
  );
};

export default Layout;