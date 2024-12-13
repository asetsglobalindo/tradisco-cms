import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";

interface DynamicObject {
  [key: string]: any;
}

interface ApiServiceObject {
  useToken: boolean;
  useOGN: boolean;
  secure: () => any;
  external: () => any;
  noOG: () => any;
  setHeaderToken: (headers: DynamicObject) => Promise<DynamicObject>;

  get: (resource: string, params?: DynamicObject, headers?: DynamicObject) => Promise<AxiosResponse<any>>;
  delete: (resource: string, params?: DynamicObject, headers?: DynamicObject) => Promise<AxiosResponse<any>>;
  post: (
    resource: string,
    params?: DynamicObject,
    headers?: DynamicObject,
    config?: DynamicObject
  ) => Promise<AxiosResponse<any>>;
  put: (
    resource: string,
    params?: DynamicObject,
    headers?: DynamicObject,
    config?: DynamicObject
  ) => Promise<AxiosResponse<any>>;
  patch: (
    resource: string,
    params?: DynamicObject,
    headers?: DynamicObject,
    config?: DynamicObject
  ) => Promise<AxiosResponse<any>>;
}

const API_URL = `${import.meta.env.VITE_APP_BASE_URL}`;
const ORGANIZATION_ID = `${import.meta.env.VITE_APP_ORGANIZATION_ID}`;

const api = axios.create({
  baseURL: API_URL,
});

const ApiService: ApiServiceObject = {
  // Security Variable
  useToken: true,
  useOGN: true,
  secure() {
    this.useToken = true;
    return this;
  },
  noOG() {
    this.useOGN = false;
    return this;
  },
  external() {
    this.useToken = false;
    return this;
  },

  // Set security config in the headers
  async setHeaderToken(headers) {
    const token = Cookies.get("token");
    if (this.useToken) headers.Authorization = token;

    if (this.useOGN) {
      headers.organizationid = ORGANIZATION_ID;
    }
    return headers;
  },

  // METHODS
  async get(resource, params = {}, headers = {}) {
    headers = await this.setHeaderToken(headers);
    const token = Cookies.get("token");
    if (token) {
      headers.Authorization = token;
    }

    return await api.get(`${resource}`, {
      params,
      headers,
    });
  },
  async delete(resource, data = {}, headers = {}) {
    headers = await this.setHeaderToken(headers);

    return await api.delete(`${resource}`, {
      data,
      headers,
    });
  },

  async post(resource, payload = {}, headers = {}, config = {}) {
    headers = {
      "accept-language": "en",
    };
    headers = await this.setHeaderToken(headers);
    config.headers = headers;
    return await api.post(`${resource}`, payload, config);
  },

  async put(resource, payload = {}, headers = {}, config = {}) {
    headers = await this.setHeaderToken(headers);
    config.headers = headers;
    return await api.put(`${resource}`, payload, config);
  },

  async patch(resource, payload = {}, headers = {}, config = {}) {
    headers = await this.setHeaderToken(headers);
    config.headers = headers;
    return await api.patch(`${resource}`, payload, config);
  },
};

api.interceptors.response.use(
  (res) => {
    if (res.data.status === 403) {
      Cookies.remove("token");
    }

    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ApiService;
