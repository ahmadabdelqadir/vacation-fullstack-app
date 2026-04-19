export type Role = "User" | "Admin";

export interface UserModel {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

export interface AuthResponse {
    token: string;
    user: UserModel;
}
