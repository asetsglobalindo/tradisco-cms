import ApiService from "@/lib/ApiService";
import {AxiosResponse} from "axios";
import {
  UserActifityLogResponseType,
  UserGetDetailsResponseType,
  UserGetResponseType,
  UserLoginResponseType,
  UserRoleGetDetailsResponseType,
  UserRoleGetResponseType,
} from "@/types/user";

const UserServices = {
  async login(data: {email: string; password: string}): Promise<AxiosResponse<UserLoginResponseType>> {
    return await ApiService.external().post("/user/login", data);
  },
  async get({
    page = 1,
    limit = 1,
    query,
    user_level,
  }: {
    page: number;
    limit: number;
    query?: string;
    user_level?: string;
  }): Promise<AxiosResponse<UserGetResponseType>> {
    let query_params: any = {
      page,
      limit,
      query,
    };

    if (user_level) {
      query_params.user_level = user_level;
    }

    return await ApiService.secure().get("/user", query_params);
  },
  async getDetails({id}: {id: string}): Promise<AxiosResponse<UserGetDetailsResponseType>> {
    return await ApiService.secure().get(`/user/detail/${id}`);
  },
  async getRole({
    page = 1,
    limit = 20,
  }: {
    page: number;
    limit: number;
  }): Promise<AxiosResponse<UserRoleGetResponseType>> {
    return await ApiService.secure().get(`/role?page=${page}&limit=${limit}`);
  },
  async getRoleDetails({id}: {id: string}): Promise<AxiosResponse<UserRoleGetDetailsResponseType>> {
    return await ApiService.secure().get(`/role/${id}`);
  },

  async getLogs({
    userId,
    page = 1,
    limit = 1,
  }: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<AxiosResponse<UserActifityLogResponseType>> {
    return await ApiService.secure().get(`/user/log?page=${page}&limit=${limit}&user_id=${userId}`);
  },
};

export default UserServices;
