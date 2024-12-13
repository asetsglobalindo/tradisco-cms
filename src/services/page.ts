import ApiService from "@/lib/ApiService";

import {PageMenuResponseType, PageResponseType} from "@/types/page";
import {AxiosResponse} from "axios";

const PageServices = {
  async getMenu(): Promise<AxiosResponse<PageMenuResponseType>> {
    return await ApiService.secure().get("/page/menu");
  },
  async get({page = 1, limit = 1}: {page: number; limit: number}): Promise<AxiosResponse<PageResponseType>> {
    return await ApiService.secure().get(`/page?page=${page}&limit=${limit}`);
  },
};

export default PageServices;

