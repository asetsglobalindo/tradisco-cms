import ApiService from "@/lib/ApiService";
import {ImageResponse} from "@/types";
import {AxiosResponse} from "axios";

const ImageServices = {
  async get({
    page = 1,
    limit = 1,
    type,
    query,
    ids,
  }: {
    page: number;
    limit: number;
    query?: string;
    ids?: string;
    type?: string;
  }): Promise<AxiosResponse<ImageResponse>> {
    let endpoint = `/image?page=${page}&limit=${limit}`;
    let params: any = {};

    if (query) {
      params.query = query;
    }

    if (ids) {
      params.image_ids = ids;
    }
    if (type) {
      params.type = type;
    }

    return await ApiService.secure().get(endpoint, params);
  },
};

export default ImageServices;
