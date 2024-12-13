import {PagesType} from ".";

export type HeaderType = {
  active_status: boolean;
  childs:
    | {
        name: {
          [key: string]: string;
        };
        order: number;
        route: string;
        _id: string;
      }[]
    | [];
  created_at: string;
  created_by: string;
  name: {
    [key: string]: string;
  };
  order: number;
  organization_id: string;
  route: string;
  _id: string;
};

export type HeaderResponseType = {
  success: boolean;
  status: number;
  data: HeaderType[] | [];
  message: string;
  pages: PagesType;
  err: string;
};
export type HeaderResponseDetailType = {
  success: boolean;
  status: number;
  data: HeaderType;
  message: string;
  pages: PagesType;
  err: string;
};
