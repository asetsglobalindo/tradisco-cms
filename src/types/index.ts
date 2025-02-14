import {Icons} from "@/components/Icons";

export interface OtherRoute {
  title: {
    id: string;
    en: string;
  };
  route: string;
  order: number;
  _id: string;
}

export interface FooterType {
  tagline: {
    id: string;
    en: string;
  };
  _id: string;
  url_instagram: string;
  url_facebook: string;
  url_linkedin: string;
  url_mail: string;
  address: string;
  mail: string;
  tel: string;
  copyright_text: string;
  copyright_link: string;
  created_at: string;
  created_by: string;
  __v: number;
  other_routes: OtherRoute[];
  updated_at: string;
  updated_by: string;
}

export interface ResponseType<T> {
  success: boolean;
  status: number;
  data: T;
  message: string;
  err: string;
  pages: PagesType;
}

export interface Permissions {
  create: boolean;
  update: boolean;
  delete: boolean;
  view: boolean;
  approval: boolean;
  import: boolean;
  export: boolean;
}

export interface NavItem {
  title: string;
  icon: string;
  label: string;
  routes: {title: string; href: string; icon: keyof typeof Icons; label: string}[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type PagesType = {
  current_page: number;
  total_data: number;
};

export type UOMType = {
  created_at: string;
  created_by: string;
  name: string;
  organization_id: string;
  system_name: string;
  _id: string;
};
export type OnlineStoreType = {
  created_at: string;
  _id: string;
  created_by: string;
  organization_id: string;
  name: string;
};

export type ImageType = {
  _id: string;
  type: string;
  path: string;
  name: string;
  size: number;
  url: string;
};

export type ImageItemType = {
  type: string;
  is_embedded_video: boolean;
  created_at: string;
  _id: string;
  organization_id: string;
  created_by: string;
  title: string;
  description: string;
  active_status: boolean;
  images: ImageType[] | [];
  images_mobile: ImageType[] | [];
};

export interface ImageResponse extends ResponseType<ImageItemType[] | []> {}
export interface UOMResponse extends ResponseType<UOMType[] | []> {}
export interface OnlineStoreResponse extends ResponseType<OnlineStoreType[] | []> {}

export type TODO = any;
