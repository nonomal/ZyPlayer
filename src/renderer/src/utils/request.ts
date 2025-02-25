import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// import { getPinia } from '@/utils/tool';

const baseURL = String(
  import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_URL_PREFIX}`,
);

// const TIMEOUT = getPinia('setting', 'timeout') < 1000 ? 1000 : getPinia('setting', 'timeout');

const service: AxiosInstance = axios.create({
  baseURL,
  // timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  withCredentials: false,
});

service.interceptors.request.use(
  // @ts-ignore
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

const request = async (config: AxiosRequestConfig) => {
  if (config?.timeout && config?.timeout < 5000) {
    delete config.timeout;
  }
  const res = await service.request(config);
  if (res.data.code === 0 && res.status === 200) {
    return res.data.data;
  } else {
    throw new Error(res.data.msg);
  }
};

const requestComplete: any = async (config: AxiosRequestConfig) => {
  if (config?.timeout && config?.timeout < 5000) {
    delete config.timeout;
  }
  const { status, data, headers } = await service.request(config);
  return {
    status,
    data,
    headers,
  };
};

export { request as default, requestComplete };
