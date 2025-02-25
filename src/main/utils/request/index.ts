import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';
import PQueue from 'p-queue';

const getTimeout = (timeout: number | undefined | null) => {
  const baseTimeout = 5000;

  if (timeout !== null && timeout !== undefined) {
    return Math.max(baseTimeout, timeout);
  }

  if (globalThis.variable?.timeout) {
    return Math.max(baseTimeout, globalThis.variable.timeout);
  }

  return baseTimeout;
};

const service: AxiosInstance = axios.create({
  timeout: 5000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

// @ts-ignore
service.interceptors.request.use((config: AxiosRequestConfig) => {
  if (globalThis.variable?.debug) {
    config.proxy = {
      host: '127.0.0.1',
      port: 9979,
    };
  }
  return config;
});

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

const request = async (config: AxiosRequestConfig) => {
  config.timeout = getTimeout(config?.timeout);
  const { data } = await service.request(config);
  return data;
};

const completeRequest = async (config: AxiosRequestConfig) => {
  config.timeout = getTimeout(config?.timeout);
  const { status, data, headers } = await service.request(config);

  return {
    code: status,
    data,
    headers: { ...headers },
  };
};

const batchRequest = async (doc: any) => {
  const { items, max_workers = '5' } = doc;
  const queue = new PQueue({ concurrency: parseInt(max_workers) });

  const promises: Promise<any>[] = items.map((item) => {
    return queue.add(async () => {
      try {
        const response = await service.request(
          Object.assign({}, item?.options, {
            url: item.url,
            method: item?.options?.method || 'GET',
            timeout: getTimeout(item?.options?.timeout),
            responseType: 'text',
          }),
        );
        return response.data;
      } catch (err) {
        return null;
      }
    });
  });
  const results = await Promise.all(promises);

  return {
    code: 0,
    msg: 'ok',
    data: results,
  };
};

export { request as default, completeRequest, batchRequest };
