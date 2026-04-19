import { Types } from "mongoose";
import { LikeModel } from "../models/like-model";
import { VacationModel } from "../models/vacation-model";
import { ForbiddenError, ResourceNotFoundError } from "../models/client-errors";
import { Role } from "../models/enums";
import { TokenUser } from "../utils/cyber";

class LikeService {

    public async like(vacationId: string, user: TokenUser): Promise<{ liked: boolean; totalLikes: number }> {
        this.assertRegularUser(user);
        const vid = this.toObjectId(vacationId);
        await this.assertVacationExists(vid);

        try {
            await LikeModel.updateOne(
                { userId: new Types.ObjectId(user._id), vacationId: vid },
                { $setOnInsert: { userId: new Types.ObjectId(user._id), vacationId: vid } },
                { upsert: true }
            );
        } catch (err) {
            // Error 11000 = duplicate key. That means the like is already there,
            // so we just ignore it. Any other error is real and should bubble up.
            const mongoErr = err as { code?: number };
            if (mongoErr.code !== 11000) throw err;
        }

        const totalLikes = await LikeModel.countDocuments({ vacationId: vid });
        return { liked: true, totalLikes };
    }

    public async unlike(vacationId: string, user: TokenUser): Promise<{ liked: boolean; totalLikes: number }> {
        this.assertRegularUser(user);
        const vid = this.toObjectId(vacationId);
        await this.assertVacationExists(vid);

        await LikeModel.deleteOne({ userId: new Types.ObjectId(user._id), vacationId: vid });
        const totalLikes = await LikeModel.countDocuments({ vacationId: vid });
        return { liked: false, totalLikes };
    }

    private assertRegularUser(user: TokenUser): void {
        if (user.role !== Role.User) {
            throw new ForbiddenError("Admins cannot like vacations.");
        }
    }

    private toObjectId(id: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)) throw new ResourceNotFoundError(id);
        return new Types.ObjectId(id);
    }

    private async assertVacationExists(id: Types.ObjectId): Promise<void> {
        const exists = await VacationModel.exists({ _id: id });
        if (!exists) throw new ResourceNotFoundError(String(id));
    }
}

export const likeService = new LikeService();
