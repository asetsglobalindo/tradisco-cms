import ApiService from "@/lib/ApiService";
import {EmailDetailsResponseType, EmailResponseType} from "@/types/email";
import {AxiosResponse} from "axios";

const EmailServices = {
  async get({page = 1, limit = 1}: {page: number; limit: number}): Promise<AxiosResponse<EmailResponseType>> {
    return await ApiService.secure().get(`/email?page=${page}&limit=${limit}`);
  },
  async getDetails({id}: {id: string}): Promise<AxiosResponse<EmailDetailsResponseType>> {
    return await ApiService.secure().get(`/email/detail/${id}`);
  },
};

export default EmailServices;

