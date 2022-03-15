import type { AxiosRequestConfig, Canceler } from "axios";
import axios, {AxiosResponse} from "axios";
import { isFunction } from "../is";
import {RequestConfig} from "./types";
import Request from "./index";

export const getPendingUrl = (config: AxiosRequestConfig) => [config.method, config.url].join("&");

export class AxiosCanceler {
  private readonly Request: Request;
  private pendingMap: Map<string, Canceler>;

  constructor(request: Request) {
    this.Request = request;
    this.pendingMap = new Map<string, Canceler>();
  }

  /**
   * 添加请求
   * @param {Object} config
   */
  addPending(config: AxiosRequestConfig) {
    this.removePending(config);
    const url = getPendingUrl(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!this.pendingMap.has(url)) {
          this.pendingMap.set(url, cancel);
        }
      });
  }

  /**
   * 清除所有pending状态的请求
   */
  removeAllPending() {
    this.pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel();
    });
    this.pendingMap.clear();
  }

  /**
   * 删除请求
   * @param {Object} config
   */
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config);

    if (this.pendingMap.has(url)) {
      const cancel = this.pendingMap.get(url);
      cancel && cancel(url);
      this.pendingMap.delete(url);
    }
  }

  /**
   * 重复请求拦截
   * @param {RequestConfig} config
   * @returns
   */
  requestCancelInterceptors(config: RequestConfig): RequestConfig {
    // 如果打开取消重复请求，则取消重复请求
    const {ignoreCancelToken} = config.requestOptions || {};
    const ignoreCancel =
      ignoreCancelToken !== undefined
        ? ignoreCancelToken
        : this.Request.defaultRequestOptions.ignoreCancelToken;

    !ignoreCancel && this.addPending(config);

    return config;
  }

  /**
   * 请求响应以后删除缓存
   * @param {AxiosResponse} res
   * @private
   */
  responseCancelInterceptors(res: AxiosResponse): any {
    res && this.removePending(res.config);
    return res;
  }

  /**
   * @description: reset
   */
  reset(): void {
    this.pendingMap = new Map<string, Canceler>();
  }
}
