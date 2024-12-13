import {PagesType} from ".";

export type EmailType = {
  cc: string[] | [];
  bcc: string[] | [];
  created_at: string;
  _id: string;
  organization_id: string;
  created_by: string;
  body: string;
  subject: string;
  type: number;
  updated_at: string;
  updated_by: string;
};
export type EmailResponseType = {
  success: boolean;
  status: number;
  data: EmailType[] | [];
  message: string;
  pages: PagesType;
  err: string;
};
export type EmailDetailsResponseType = {
  success: boolean;
  status: number;
  data: EmailType;
  message: string;
  pages: PagesType;
  err: string;
};

