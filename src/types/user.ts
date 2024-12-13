import {PagesType} from ".";

export interface UserPermissionType {
  actions: {
    create: boolean;
    update: boolean;
    delete: boolean;
    view: boolean;
    approval: boolean;
    import: boolean;
    export: boolean;
  };
  _id: string;
  page_id: {
    _id: string;
    name: string;
    group: string;
    order: number;
    route: string;
  };
}

export interface UserRoleType {
  default_role: boolean;
  _id: string;
  name: string;
  organization_id: string;
  description: string;
  permissions: UserPermissionType[];
  created_at: string;
}

export interface UserOrganizationType {
  _id: string;
  organization_id: string;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role_id: UserRoleType;
  phone_number: string;
  organizations: UserOrganizationType[];
  first_name: string;
  last_name: string;
}

export interface UserDetailsType {
  active_status: boolean;
  activity_log: [];
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  phone_number: string;
  point_log: [];
  role_id: string;
  spending_amount: number;
  _id: string;
}

export interface UserGetItemType {
  _id: string;
  name: string;
  email: string;
  member_point: number;
  role_id: UserRoleType;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGetResponseType {
  success: boolean;
  status: number;
  data: UserGetItemType[] | [];
  message: string;
  pages: PagesType;
  err: string;
}

export interface UserLoginResponseType {
  success: boolean;
  status: number;
  data: {
    user: UserType;
    token: string;
  };
  message: string;
  err: string;
}

export interface UserRoleGetResponseType {
  success: boolean;
  status: number;
  data: UserRoleType[];
  message: string;
  err: string;
  pages: PagesType;
}

export interface UserActifityLogType {
  activity: number;
  created_at: string;
  description: string;
  model: string;
  name: null;
  _id: string;
}

export interface UserGetDetailsResponseType {
  success: boolean;
  status: number;
  data: UserDetailsType;
  message: string;
  err: string;
  pages: PagesType;
}

export interface UserRoleGetDetailsResponseType {
  success: boolean;
  status: number;
  data: UserRoleType;
  message: string;
  err: string;
  pages: PagesType;
}

export interface UserActifityLogResponseType {
  success: boolean;
  status: number;
  data: UserActifityLogType[] | [];
  message: string;
  err: string;
  pages: PagesType;
}

export interface UserAddress {
  active_status: boolean;
  address: string;
  city: string;
  codes: {_id: string; courier_id: string; code: string}[] | [];
  country: string;
  created_at: string;
  created_by: string;
  district: string;
  email: string;
  name: string;
  organization_id: string;
  phone_number: string;
  postal_code: string;
  province: string;
  urban: string;
  user_name: string;
  _id: string;
}
