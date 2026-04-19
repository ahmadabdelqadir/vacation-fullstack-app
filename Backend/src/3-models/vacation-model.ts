import joi from "joi";
import { Document, model, Schema } from "mongoose";
import { ValidationError } from "./client-errors";
import { Continent } from "./enums";

/**
 * Input DTO used by admin create/update endpoints.
 * The image is a multipart upload handled separately in the controller.
 */
export class VacationInputModel {
    public vacationCode?: string;
    public destination!: string;
    public description!: string;
    public startDate!: Date;
    public endDate!: Date;
    public price!: number;
    public continent!: Continent;
    public imageFileName?: string;

    public constructor(payload: Partial<VacationInputModel>) {
        Object.assign(this, payload);
        if (this.startDate) this.startDate = new Date(this.startDate);
        if (this.endDate) this.endDate = new Date(this.endDate);
        if (this.price !== undefined && this.price !== null) this.price = Number(this.price);
    }

    private static schema = joi.object({
        vacationCode: joi.string().optional().min(2).max(40),
        destination: joi.string().required().min(2).max(100),
        description: joi.string().required().min(5).max(2000),
        startDate: joi.date().required(),
        endDate: joi.date().required().min(joi.ref("startDate")),
        price: joi.number().required().min(0).max(10000),
        continent: joi.string().required().valid(...Object.values(Continent)),
        imageFileName: joi.string().optional().max(255)
    });

    public validate(): void {
        const result = VacationInputModel.schema.validate(this);
        if (result.error) throw new ValidationError(result.error.message);
    }
}

export interface IVacationDocument extends Document {
    _id: any;
    vacationCode: string;
    destination: string;
    description: string;
    startDate: Date;
    endDate: Date;
    price: number;
    imageFileName: string;
    continent: Continent;
    createdAt: Date;
    updatedAt: Date;
}

const vacationSchema = new Schema<IVacationDocument>(
    {
        vacationCode: { type: String, required: true, unique: true, trim: true },
        destination: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        price: { type: Number, required: true, min: 0, max: 10000 },
        imageFileName: { type: String, required: true },
        continent: { type: String, enum: Object.values(Continent), required: true }
    },
    { timestamps: true, versionKey: false }
);

vacationSchema.index({ startDate: 1 });

export const VacationModel = model<IVacationDocument>("Vacation", vacationSchema);
