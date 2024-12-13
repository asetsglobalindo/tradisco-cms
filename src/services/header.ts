import ApiService from "@/lib/ApiService";
import {HeaderResponseDetailType, HeaderResponseType} from "@/types/header";
import {AxiosResponse} from "axios";

const HeaderServices = {
  async get({page = 1, limit = 1}: {page: number; limit: number}): Promise<AxiosResponse<HeaderResponseType>> {
    return await ApiService.secure().get(`/header?page=${page}&limit=${limit}`);
  },
  async getDetails({id}: {id: string}): Promise<AxiosResponse<HeaderResponseDetailType>> {
    return await ApiService.secure().get(`/header/detail/${id}`);
  },
};

export default HeaderServices;

