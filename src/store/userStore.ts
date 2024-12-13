import {decrypt, encrypt} from "@/lib/encrypt";
import {PageMenuItemType} from "@/types/page";
import {UserPermissionType, UserType} from "@/types/user";
import {create} from "zustand";
import {persist} from "zustand/middleware";
// import { devtools } from "zustand/middleware";

const user_default_data = {
  _id: null,
  email: null,
  name: null,
  first_name: null,
  last_name: null,
  isLoggedIn: false,
  role_id: null,
};

interface UserState {
  user: {
    _id: string | null;
    email: string | null;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    role_id: string | null;
    isLoggedIn: boolean;
  };
  route_permissions: UserPermissionType[] | [];
  route_menu: PageMenuItemType[] | [];
  user_addresses: any;
  development: boolean;
  setUser: (payload: UserType) => void;
  resetUser: () => void;
  setRoutePermissions: (payload: UserPermissionType[]) => void;
  setRouteMenu: (payload: PageMenuItemType[]) => void;
  setUserAddresses: (payload: UserType) => void;
  setDevelopment: (payload: boolean) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // states
      user: user_default_data,
      user_addresses: [],
      // difference between this two is route menu is menu that exist in sidebar layout
      route_permissions: [],
      // route permission is route permission in router
      route_menu: [],
      development: false,

      // methods
      setUser: (payload) => {
        const data = {
          _id: payload._id,
          email: payload.email,
          name: payload.name,
          first_name: payload.first_name,
          last_name: payload.last_name,
          role_id: payload.role_id._id,
          isLoggedIn: true,
        };
        set((currentState) => ({...currentState, user: data}));
      },
      resetUser: () => {
        set({user: user_default_data, route_permissions: [], route_menu: [], user_addresses: []});
      },
      setRoutePermissions: (payload) => {
        set((currentState) => ({...currentState, route_permissions: payload}));
      },
      setRouteMenu: (payload) => {
        set((currentState) => ({...currentState, route_menu: payload}));
      },
      setUserAddresses: (payload) => {
        set((currentState) => ({...currentState, user_addresses: payload}));
      },
      setDevelopment: (payload) => {
        set((currentState) => ({...currentState, development: payload}));
      },
    }),
    {
      name: "user",
      serialize: (state) => {
        return encrypt(JSON.stringify(state));
      },
      deserialize: (state) => {
        const decryptedData = decrypt(state);
        return JSON.parse(decryptedData);
      },
    }
  )
);

export default useUserStore;
