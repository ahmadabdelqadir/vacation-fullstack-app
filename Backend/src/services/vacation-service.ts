import { PipelineStage, Types } from "mongoose";
import { VacationFilter } from "../models/enums";
import { IVacationDocument, VacationModel } from "../models/vacation-model";
import { LikeModel } from "../models/like-model";
import { ResourceNotFoundError, ValidationError } from "../models/client-errors";

type DateFilter = {
    startDate?: { $lte?: Date; $gt?: Date };
    endDate?: { $gte?: Date };
};

export interface VacationListItem {
    _id: string;
    vacationCode: string;
    destination: string;
    description: string;
    startDate: Date;
    endDate: Date;
    price: number;
    imageFileName: string;
    continent: string;
    totalLikes: number;
    isLikedByCurrentUser: boolean;
}

export interface PageResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ListOptions {
    page: number;
    pageSize: number;
    filter: VacationFilter;
    userId: string;
}

class VacationService {

    public async list(options: ListOptions): Promise<PageResult<VacationListItem>> {
        const { page, pageSize, filter, userId } = options;
        if (page < 1) throw new ValidationError("Page must be >= 1.");
        if (pageSize < 1 || pageSize > 100) throw new ValidationError("Page size out of range.");

        const now = new Date();
        const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

        const dateFilter: DateFilter = {};
        if (filter === VacationFilter.Active) {
            dateFilter.startDate = { $lte: now };
            dateFilter.endDate = { $gte: now };
        } else if (filter === VacationFilter.Upcoming) {
            dateFilter.startDate = { $gt: now };
        }

        const basePipeline: PipelineStage[] = [
            { $match: dateFilter },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "vacationId",
                    as: "likesArr"
                }
            },
            {
                $addFields: {
                    totalLikes: { $size: "$likesArr" },
                    isLikedByCurrentUser: userObjectId
                        ? { $in: [userObjectId, "$likesArr.userId"] }
                        : false
                }
            },
            { $project: { likesArr: 0 } }
        ];

        if (filter === VacationFilter.Liked) {
            basePipeline.push({ $match: { isLikedByCurrentUser: true } });
        }

        const countPipeline: PipelineStage[] = [...basePipeline, { $count: "total" }];
        const dataPipeline: PipelineStage[] = [
            ...basePipeline,
            { $sort: { startDate: 1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
        ];

        const [countResult, items] = await Promise.all([
            VacationModel.aggregate<{ total: number }>(countPipeline),
            VacationModel.aggregate<VacationListItem>(dataPipeline)
        ]);

        const total = countResult[0]?.total ?? 0;

        return {
            items: items.map(vacation => ({ ...vacation, _id: String(vacation._id) })),
            total,
            page,
            pageSize
        };
    }

    public async getById(id: string, userId: string): Promise<VacationListItem> {
        if (!Types.ObjectId.isValid(id)) throw new ResourceNotFoundError(id);

        const vacation = await VacationModel.findById(id).lean();
        if (!vacation) throw new ResourceNotFoundError(id);

        const [total, liked] = await Promise.all([
            LikeModel.countDocuments({ vacationId: vacation._id }),
            Types.ObjectId.isValid(userId)
                ? LikeModel.exists({ vacationId: vacation._id, userId: new Types.ObjectId(userId) })
                : Promise.resolve(null)
        ]);

        return {
            _id: String(vacation._id),
            vacationCode: vacation.vacationCode,
            destination: vacation.destination,
            description: vacation.description,
            startDate: vacation.startDate,
            endDate: vacation.endDate,
            price: vacation.price,
            imageFileName: vacation.imageFileName,
            continent: vacation.continent,
            totalLikes: total,
            isLikedByCurrentUser: !!liked
        };
    }

    public async getRaw(id: string): Promise<IVacationDocument> {
        if (!Types.ObjectId.isValid(id)) throw new ResourceNotFoundError(id);
        const v = await VacationModel.findById(id);
        if (!v) throw new ResourceNotFoundError(id);
        return v;
    }
}

export const vacationService = new VacationService();
