import environment from '@/environment';
import axiosInstance from '@/axios/axios-wrapper';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export type DefaultApiResponse<T = any, M = any> = {
    data: T;
    message: string;
    metadata: M;
};

export default class ApiService {

    constructor(private apiEndpoint: string = environment.apiEndpoint) {
    }

    private getEndpoint(endpoint: string) {
        // console.log(this.apiEndpoint, endpoint, [this.apiEndpoint, endpoint].join('/'));
        return [this.apiEndpoint, endpoint].join('/').replace(/([^:]\/)\/+/g, '$1');
    }

    wrap<T extends Promise<AxiosResponse>>(method: T) {
        return from(method);
    }

    get<T extends any = any, M extends any = any, AR = DefaultApiResponse<T, M>>(url: string, config?: AxiosRequestConfig<T>) {
        return this.wrap(
            axiosInstance.get<AR>(this.getEndpoint(url), config)
        ).pipe(
            map(({data}) => data)
        );
    }

    post<D extends any, T extends any, M extends any = any, AR = DefaultApiResponse<T, M>>(url: string, data: D, config?: AxiosRequestConfig<T>) {
        return this.wrap(
            axiosInstance.post<D, AxiosResponse<AR>>(this.getEndpoint(url), data, config)
        ).pipe(
            map(({data}) => data)
        );
    }

    delete<T extends any = any, M extends any = any, AR = DefaultApiResponse<T, M>>(url: string, config?: AxiosRequestConfig<T>) {
        return this.wrap(
            axiosInstance.delete<AR>(this.getEndpoint(url), config)
        ).pipe(
            map(({data}) => data)
        );
    }

}
