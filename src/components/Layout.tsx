import React from "react";
import Header from "./Layout/Header";
import Sidebar from "./Layout/Sidebar";
import {Outlet} from "react-router-dom";

const Layout = () => {
  return (
    <React.Fragment>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="w-full">
          <section className="flex-1 mx-4 mt-10 mb-4 md:mx-8 ">
            <div className="w-full h-10"></div>
            <Outlet />
          </section>
        </main>
      </div>
    </React.Fragment>
  );
};

export default Layout;

