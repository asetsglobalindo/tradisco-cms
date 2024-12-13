import {Navigate, Route, Routes} from "react-router-dom";
import Login from "./pages/Login";
import PermissionAuth from "./components/PermissionAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import pagesList from "./routes";
import useUserStore from "./store/userStore";
import {TODO} from "./types";
import "ckeditor5/ckeditor5.css";

function App() {
  const userStore = useUserStore((state) => state);

  return (
    <Routes>
      {/* default route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />

      {/* route needed permissions */}
      <Route element={<PermissionAuth />}>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />}></Route>
          {userStore.development
            ? pagesList.map((page: TODO, index) => {
                const removeDashboardPrefix = page.route.split("/")[2];
                return (
                  <Route key={index * 2} path={removeDashboardPrefix}>
                    <>
                      <Route
                        index
                        element={
                          <page.component
                            permissions={{
                              create: true,
                              update: true,
                              delete: true,
                              view: true,
                              approval: true,
                              import: true,
                              export: true,
                            }}
                          />
                        }
                      />
                      {page.hasChild &&
                        page.childs.map((child: TODO, childIdx: number) => {
                          let removePrefix = child?.route.split(removeDashboardPrefix)[1].split("/");
                          removePrefix.shift();
                          let finalPath = removePrefix.join("/");
                          return <Route key={childIdx * 68} path={finalPath} element={<child.component />} />;
                        })}
                    </>
                  </Route>
                );
              })
            : pagesList.map((page: TODO, index) => {
                const removeDashboardPrefix = page.route.split("/")[2];
                const findPermissionRoute = userStore.route_permissions.find(
                  (permission) => permission?.page_id?.route === page.route
                );
                return (
                  findPermissionRoute?.actions.view && (
                    <Route key={index * 2} path={removeDashboardPrefix}>
                      <>
                        <Route index element={<page.component permissions={findPermissionRoute?.actions} />} />
                        {page.hasChild &&
                          page.childs.map((child: TODO, childIdx: number) => {
                            let removePrefix = child?.route.split(removeDashboardPrefix)[1].split("/");
                            removePrefix.shift();
                            let finalPath = removePrefix.join("/");
                            let givenAccess =
                              (findPermissionRoute?.actions.create && child.access === "create") ||
                              (findPermissionRoute?.actions.update && child.access === "update");
                            return (
                              givenAccess && (
                                <Route key={childIdx * 68} path={finalPath} element={<child.component />} />
                              )
                            );
                          })}
                      </>
                    </Route>
                  )
                );
              })}
        </Route>
      </Route>
      {/* catch no match route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
