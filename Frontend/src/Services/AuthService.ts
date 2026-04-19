import type { CredentialsModel, RegisterModel } from "../Models/CredentialsModel";
import type { AuthResponse, UserModel } from "../Models/UserModel";
import { http } from "./HttpService";
import { appConfig } from "../Utils/AppConfig";
import { authStore } from "../Stores/AuthStore";

class AuthService {

    public async register(payload: RegisterModel): Promise<AuthResponse> {
        const response = await http.post<AuthResponse>(appConfig.authUrls.register, payload);
        authStore.login(response);
        return response;
    }

    public async login(credentials: CredentialsModel): Promise<AuthResponse> {
        const response = await http.post<AuthResponse>(appConfig.authUrls.login, credentials);
        authStore.login(response);
        return response;
    }

    public logout(): void {
        authStore.logout();
    }

    public async refreshMe(): Promise<UserModel> {
        return http.get<UserModel>(appConfig.authUrls.me);
    }
}

export const authService = new AuthService();
