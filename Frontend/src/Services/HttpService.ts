import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { appConfig } from "../Utils/AppConfig";
import { authStore } from "../Stores/AuthStore";

class HttpService {
    public readonly axios: AxiosInstance;

    public constructor() {
        this.axios = axios.create({ baseURL: appConfig.apiBaseUrl });

        this.axios.interceptors.request.use(config => {
            const token = authStore.token;
            if (token) {
                config.headers = config.headers ?? {};
                (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.axios.interceptors.response.use(
            response => response,
            error => {
                const status = error?.response?.status;
                if (status === 401) {
                    authStore.logout();
                }
                return Promise.reject(error);
            }
        );
    }

    public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.axios.get<T>(url, config).then(response => response.data);
    }

    public post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return this.axios.post<T>(url, body, config).then(response => response.data);
    }

    public put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return this.axios.put<T>(url, body, config).then(response => response.data);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.axios.delete<T>(url, config).then(response => response.data);
    }
}

export const http = new HttpService();
