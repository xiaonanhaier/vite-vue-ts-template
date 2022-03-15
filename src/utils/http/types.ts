import type { AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestOptions {
  // 忽略取消请求处理
  ignoreCancelToken?: boolean;
}

export interface RequestInterceptors {
  // 请求拦截
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorsCatch?: (err: any) => any;
  // 响应拦截
  responseInterceptors?: <T = AxiosResponse>(res: T) => any;
  responseInterceptorsCatch?: (err: any) => any;
}
// 自定义传入的参数
export interface RequestConfig extends AxiosRequestConfig {
  interceptors?: RequestInterceptors;
  requestOptions?: RequestOptions;
}
export interface CancelRequestSource {
  [index: string]: () => void;
}
