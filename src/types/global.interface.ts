import { AxiosResponse } from 'axios';
import { Component, UnwrapRef } from 'vue';

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RestGetResponse<T = any> = {
    data: T;
    message: string;
    metadata: any; // TODO typing metadata
};

export type RestPostResponse<T> = AxiosResponse<RestGetResponse<T>>;

export type Contains<T> = Required<T> & {[key: string]: any};

export type SwapWithType<Source, Key extends keyof Source, NewType> = Omit<Source, Key> & { [K in Key]: NewType };

export type UnwrapRefsInObject<T> = {
    [K in keyof T]: UnwrapRef<Required<T>[K]>;
}

import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        permissions?: string[];
        checkHierarchy?: boolean;
    }
}

interface TabProps {
    [key: string]: any;
}

interface TabConfig {
    label: string;
    component: Component;
    show: boolean;
    props?: TabProps;
}

export type TabsConfig = TabConfig[];
