import { Continent } from "../3-models/enums";
import { LikeModel } from "../3-models/like-model";
import { VacationModel } from "../3-models/vacation-model";

export interface DestinationLikes {
    destination: string;
    likes: number;
}

/**
 * Vacation-domain helpers used by both the MCP tools and the admin
 * reports endpoint. Centralizing these queries keeps the MCP tool
 * handlers thin and ensures REST + MCP return identical numbers.
 */
class McpDomainService {

    public async countActiveVacations(): Promise<{ count: number }> {
        const now = new Date();
        const count = await VacationModel.countDocuments({
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        return { count };
    }

    public async getAverageVacationPrice(): Promise<{ averagePrice: number; totalVacations: number }> {
        const result = await VacationModel.aggregate<{ _id: null; averagePrice: number; count: number }>([
            { $group: { _id: null, averagePrice: { $avg: "$price" }, count: { $sum: 1 } } }
        ]);
        const row = result[0];
        return {
            averagePrice: row ? Number(row.averagePrice.toFixed(2)) : 0,
            totalVacations: row?.count ?? 0
        };
    }

    public async getFutureVacations(): Promise<Array<{
        destination: string;
        startDate: Date;
        endDate: Date;
        price: number;
        continent: Continent;
    }>> {
        const now = new Date();
        return VacationModel.find({ startDate: { $gt: now } })
            .sort({ startDate: 1 })
            .select({ destination: 1, startDate: 1, endDate: 1, price: 1, continent: 1, _id: 0 })
            .lean();
    }

    public async getFutureEuropeanVacations(): Promise<Array<{
        destination: string;
        startDate: Date;
        endDate: Date;
        price: number;
    }>> {
        const now = new Date();
        return VacationModel.find({ startDate: { $gt: now }, continent: Continent.Europe })
            .sort({ startDate: 1 })
            .select({ destination: 1, startDate: 1, endDate: 1, price: 1, _id: 0 })
            .lean();
    }

    public async getMostLikedVacations(limit: number = 5): Promise<DestinationLikes[]> {
        const cap = Math.max(1, Math.min(50, Math.floor(limit)));
        const rows = await LikeModel.aggregate<{ destination: string; likes: number }>([
            { $group: { _id: "$vacationId", likes: { $sum: 1 } } },
            { $sort: { likes: -1 } },
            { $limit: cap },
            {
                $lookup: {
                    from: "vacations",
                    localField: "_id",
                    foreignField: "_id",
                    as: "vacation"
                }
            },
            { $unwind: "$vacation" },
            { $project: { _id: 0, destination: "$vacation.destination", likes: 1 } }
        ]);
        return rows;
    }

    public async getVacationLikesReport(): Promise<DestinationLikes[]> {
        return VacationModel.aggregate<DestinationLikes>([
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "vacationId",
                    as: "likesArr"
                }
            },
            {
                $project: {
                    _id: 0,
                    destination: 1,
                    likes: { $size: "$likesArr" }
                }
            },
            { $sort: { destination: 1 } }
        ]);
    }
}

export const mcpDomainService = new McpDomainService();
