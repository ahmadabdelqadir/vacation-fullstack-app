import { cyber, TokenUser } from "../2-utils/cyber";
import { ConflictError, UnauthorizedError } from "../3-models/client-errors";
import { Role } from "../3-models/enums";
import { CredentialsModel, IUserDocument, RegisterModel, UserModel } from "../3-models/user-model";

export interface AuthResponse {
    token: string;
    user: TokenUser;
}

class AuthService {

    public async register(payload: RegisterModel): Promise<AuthResponse> {
        payload.validate();

        const normalizedEmail = payload.email.toLowerCase().trim();
        const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
        if (existing) throw new ConflictError(`Email ${normalizedEmail} is already registered.`);

        const created = await UserModel.create({
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            email: normalizedEmail,
            passwordHash: await cyber.hash(payload.password),
            role: Role.User
        });

        const tokenUser = this.toTokenUser(created);
        return { token: cyber.generateToken(tokenUser), user: tokenUser };
    }

    public async login(credentials: CredentialsModel): Promise<AuthResponse> {
        credentials.validate();

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            throw new UnauthorizedError("Incorrect email or password.");
        }

        const passwordCheck = await cyber.verifyPassword(credentials.password, user.passwordHash);
        if (!passwordCheck.isValid) {
            throw new UnauthorizedError("Incorrect email or password.");
        }

        if (passwordCheck.shouldUpgrade) {
            user.passwordHash = await cyber.hash(credentials.password);
            await user.save();
        }

        const tokenUser = this.toTokenUser(user);
        return { token: cyber.generateToken(tokenUser), user: tokenUser };
    }

    public async getCurrentUser(id: string): Promise<TokenUser | null> {
        const user = await UserModel.findById(id).lean();
        if (!user) return null;
        return {
            _id: String(user._id),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };
    }

    private toTokenUser(user: IUserDocument): TokenUser {
        return {
            _id: String(user._id),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };
    }
}

export const authService = new AuthService();
