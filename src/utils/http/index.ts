import axios, {AxiosResponse} from "axios";
import {AxiosCanceler} from "./axiosCancel";
import type {AxiosInstance, AxiosRequestConfig, AxiosError} from "axios";
import type {RequestConfig, RequestInterceptors, RequestOptions} from "./types";

class Request {
  // axios 实例
  private instance: AxiosInstance;
  // 自定义传入的  默认配置 参数
  private readonly config: RequestConfig;
  // 取消请求对
  private axiosCanceler: AxiosCanceler;

  constructor(config: RequestConfig) {
    this.config = config;
    this.instance = axios.create(this.config);
    this.axiosCanceler = new AxiosCanceler(this);
    this.setupInterceptors();
  }

  /**
   * 获取初始化时默认的RequestOptions
   */
  get defaultRequestOptions(): RequestOptions {
    return this.config.requestOptions || {};
  }

  /**
   * 设置拦截
   * @private
   */
  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        console.log("全局请求拦截器");
        return config;
      },
      undefined
    );
    // 重复请求拦截
    this.instance.interceptors.request.use((config: RequestConfig) => this.axiosCanceler.requestCancelInterceptors(config), undefined);

    // 使用实例拦截器
    const {
      requestInterceptors, requestInterceptorsCatch,
      responseInterceptors, responseInterceptorsCatch
    } = this.config.interceptors || {};
    this.instance.interceptors.request.use(requestInterceptors, requestInterceptorsCatch);
    this.instance.interceptors.response.use(responseInterceptors, responseInterceptorsCatch);

    // 重复请求拦截
    this.instance.interceptors.response.use((res: AxiosResponse) => this.axiosCanceler.responseCancelInterceptors(res), undefined);

    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        console.log("全局响应拦截器");
        return res;
      },
      undefined
    );
  }

  request<T = any>(config: RequestConfig): Promise<T> {
    let conf: RequestConfig = JSON.parse(JSON.stringify(config));
    const {requestOptions = {}} = this.config;
    const opt: RequestOptions = Object.assign({}, {...requestOptions}, conf.requestOptions);

    // 如果我们为单个请求设置拦截器，这里使用单个请求的拦截器
    if (conf.interceptors?.requestInterceptors) {
      conf = conf.interceptors.requestInterceptors(conf);
    }
    conf.requestOptions = opt;

    return new Promise((resolve, reject) => {
      this.instance
        .request<any, AxiosResponse<T>>(conf)
        .then((res: AxiosResponse<T>) => {

          // 如果我们为单个请求设置拦截器，这里使用单个请求的拦截器
          if (conf.interceptors?.responseInterceptors) {
            res = conf.interceptors.responseInterceptors<AxiosResponse<T>>(res);
          }

          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          // 如果我们为单个请求设置拦截器，这里使用单个请求的拦截器
          if (conf.interceptors?.responseInterceptorsCatch) {
            e = conf.interceptors.responseInterceptorsCatch(e);
            reject(e);
          }
          if (axios.isAxiosError(e)) {
            // 这里重写axios的错误消息
          }
          reject(e);
        });
    });
  }

  /**
   * 取消全部请求
   */
  cancelAllRequest(): void {
    this.axiosCanceler.removeAllPending();
  }

  get<T = any>(config: RequestConfig): Promise<T> {
    return this.request({...config, method: 'GET'});
  }

  post<T = any>(config: RequestConfig): Promise<T> {
    return this.request({...config, method: 'POST'});
  }

  put<T = any>(config: RequestConfig): Promise<T> {
    return this.request({...config, method: 'PUT'});
  }

  delete<T = any>(config: RequestConfig): Promise<T> {
    return this.request({...config, method: 'DELETE'});
  }
}

export default Request;
export {RequestConfig, RequestInterceptors};
