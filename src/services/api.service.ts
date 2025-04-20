import environment from '@/environment';
import axiosInstance from '@/axios/axios-wrapper';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

// export type DefaultApiResponse<T = any, M = any> = {
//     data: T;
//     message: string;
//     metadata: M;
// };

export default class ApiService {

    constructor(private apiEndpoint: string = environment.apiEndpoint) {
    }

    private getEndpoint(endpoint: string) {
        return [this.apiEndpoint, endpoint].join('/').replace(/([^:]\/)\/+/g, '$1');
    }

    wrap<T extends Promise<AxiosResponse>>(method: T) {
        return from(method);
    }

    get<T extends any = any>(url: string, config?: any) {
        return this.wrap(
            axiosInstance.get<T>(this.getEndpoint(url), config)
        ).pipe(
            map(({data}) => data)
        );
    }

    post<D extends any, T extends any>(url: string, data: D, config?: AxiosRequestConfig<T>) {
        return this.wrap(
            axiosInstance.post<D, AxiosResponse<T>>(this.getEndpoint(url), data, config)
        ).pipe(
            map(({data}) => data)
        );
    }

    patch<D extends any, T extends any>(url: string, data: D, config?: AxiosRequestConfig<T>) {
        return this.wrap(
          axiosInstance.patch<D, AxiosResponse<T>>(this.getEndpoint(url), data, config)
        ).pipe(
          map(({data}) => data)
        );
    }

    put<D extends any, T extends any>(url: string, data: D, config?: AxiosRequestConfig<T>) {
        return this.wrap(
          axiosInstance.put<D, AxiosResponse<T>>(this.getEndpoint(url), data, config)
        ).pipe(
          map(({data}) => data)
        );
    }

    delete<T extends any = any>(url: string, config?: AxiosRequestConfig<T>) {
        return this.wrap(
            axiosInstance.delete<T>(this.getEndpoint(url), config)
        ).pipe(
            map(({data}) => data)
        );
    }
}
