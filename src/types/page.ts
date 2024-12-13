import {PagesType} from ".";

export interface PageItemType {
  label: string;
  to: string;
  icon: string;
  order: number;
  _id: string;
  actions: {
    create: boolean;
    update: boolean;
    delete: boolean;
    view: boolean;
    approval: boolean;
    import: boolean;
    export: boolean;
  };
  sub_page_id: [] | null;
}

export interface PageType extends PageItemType {
  created_at: string;
  created_by: string;
  group: string;
  name: string;
  route: string;
}

export interface PageMenuItemType {
  label: string;
  items: PageItemType[];
}

export interface PageMenuResponseType {
  success: boolean;
  status: number;
  data: PageMenuItemType[] | [];
  message: string;
}

export interface PageResponseType {
  success: boolean;
  status: number;
  data: PageType[] | [];
  message: string;
  pages: PagesType;
  err: string;
}

