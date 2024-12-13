type Image = {
  url: string;
  _id: string;
};

type Banner = {
  _id: string;
  title: string;
  description: string;
  button_name: string;
  button_route: string;
  is_embedded_video: boolean;
  images: Image[];
  images_mobile: Image[];
};

type Section1Item = {
  title: string;
  description: string;
  link: string;
  image: Banner[];
  _id: string;
};

type ContentItem = {
  name: string;
  link: string;
  image: Banner[];
  _id: string;
};

export type ResidentialItem = {
  _id: string;
  background: Banner;
  logo: Banner;
  thumbnail: Banner;
  top_name: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  top_description: string;
  section1: Section1Item[];
  section2_list: string[] | []; // Define specific type if known
  section2_description: string;
  section2_image: Banner;
  content: ContentItem[];
  organization_id: string;
  created_at: string;
  created_by: string;
  __v: number;
  active_status: boolean;
};

