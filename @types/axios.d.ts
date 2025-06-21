import { Axios as DefaultAxios } from 'axios';
declare module 'axios' {
  export interface Axios extends DefaultAxios {
    request<T = any>(_config: AxiosRequestConfig): Promise<T>;
    get<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(_url: string, _data?: any, _config?: AxiosRequestConfig): Promise<T>;
  }
}
