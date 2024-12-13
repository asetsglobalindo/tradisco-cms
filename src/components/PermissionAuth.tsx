import Cookies from "js-cookie";
import {Navigate, Outlet, useLocation} from "react-router-dom";

export default function PermissionAuth() {
  const user = Cookies.get("token");
  const location = useLocation();

  return user ? <Outlet /> : <Navigate state={{from: location}} to="/login" replace />;
}

