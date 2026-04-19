import fs from "fs";
import mongoose, { Types } from "mongoose";
import { UploadedFile } from "express-fileupload";
import { fileSaver } from "uploaded-file-saver";
import { ConflictError, ResourceNotFoundError, UnsupportedMediaError, ValidationError } from "../models/client-errors";
import { LikeModel } from "../models/like-model";
import { IVacationDocument, VacationInputModel, VacationModel } from "../models/vacation-model";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

class AdminVacationService {

    public async create(payload: VacationInputModel, imageFile: UploadedFile | undefined): Promise<IVacationDocument> {
        this.assertStartNotInPastOnCreate(payload.startDate);
        payload.imageFileName = await this.saveImageRequired(imageFile);
        payload.vacationCode = payload.vacationCode || (await this.nextVacationCode());
        payload.validate();

        await this.assertUniqueCode(payload.vacationCode);

        const doc = await VacationModel.create({
            vacationCode: payload.vacationCode,
            destination: payload.destination,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
            price: payload.price,
            continent: payload.continent,
            imageFileName: payload.imageFileName
        });
        return doc;
    }

    public async update(id: string, payload: VacationInputModel, imageFile: UploadedFile | undefined): Promise<IVacationDocument> {
        if (!Types.ObjectId.isValid(id)) throw new ResourceNotFoundError(id);
        const existing = await VacationModel.findById(id);
        if (!existing) throw new ResourceNotFoundError(id);

        if (imageFile) {
            const newFileName = await this.saveImageOptional(imageFile);
            if (newFileName) {
                const oldFile = existing.imageFileName;
                payload.imageFileName = newFileName;
                if (oldFile && oldFile !== newFileName) {
                    this.tryDeleteImage(oldFile);
                }
            } else {
                payload.imageFileName = existing.imageFileName;
            }
        } else {
            payload.imageFileName = existing.imageFileName;
        }

        payload.vacationCode = payload.vacationCode || existing.vacationCode;
        payload.validate();

        if (payload.vacationCode !== existing.vacationCode) {
            await this.assertUniqueCode(payload.vacationCode, existing._id);
        }

        existing.vacationCode = payload.vacationCode;
        existing.destination = payload.destination;
        existing.description = payload.description;
        existing.startDate = payload.startDate;
        existing.endDate = payload.endDate;
        existing.price = payload.price;
        existing.continent = payload.continent;
        existing.imageFileName = payload.imageFileName!;
        await existing.save();
        return existing;
    }

    public async remove(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new ResourceNotFoundError(id);
        const existing = await VacationModel.findById(id);
        if (!existing) throw new ResourceNotFoundError(id);

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                await LikeModel.deleteMany({ vacationId: existing._id }).session(session);
                await VacationModel.deleteOne({ _id: existing._id }).session(session);
            });
        } catch (txErr) {
            // Transactions need a replica set. On a standalone Mongo (our Docker
            // setup), fall back to deleting likes first, then the vacation.
            console.warn("Transaction unavailable, doing sequential delete:", (txErr as Error).message);
            await LikeModel.deleteMany({ vacationId: existing._id });
            await VacationModel.deleteOne({ _id: existing._id });
        } finally {
            await session.endSession();
        }

        if (existing.imageFileName) {
            this.tryDeleteImage(existing.imageFileName);
        }
    }

    private assertStartNotInPastOnCreate(startDate: Date): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate.getTime() < today.getTime()) {
            throw new ValidationError("On creation, start date cannot be in the past.");
        }
    }

    private async assertUniqueCode(code: string, exclude?: Types.ObjectId): Promise<void> {
        const existing = await VacationModel.findOne({ vacationCode: code }).select("_id").lean();
        if (existing && (!exclude || String(existing._id) !== String(exclude))) {
            throw new ConflictError(`Vacation code ${code} is already in use.`);
        }
    }

    private async nextVacationCode(): Promise<string> {
        const count = await VacationModel.estimatedDocumentCount();
        const next = String(count + 1).padStart(4, "0");
        return `VAC-${next}`;
    }

    private async saveImageRequired(file: UploadedFile | undefined): Promise<string> {
        if (!file) throw new ValidationError("A vacation image is required on create.");
        return this.saveImageInternal(file);
    }

    private async saveImageOptional(file: UploadedFile | undefined): Promise<string | null> {
        if (!file) return null;
        return this.saveImageInternal(file);
    }

    private async saveImageInternal(file: UploadedFile): Promise<string> {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
            throw new UnsupportedMediaError(`Unsupported image type: ${file.mimetype}.`);
        }
        if (file.size > MAX_IMAGE_BYTES) {
            throw new ValidationError("Image file is too large (max 4 MB).");
        }

        // fileSaver.add(file) picks its own UUID filename and returns it.
        // Don't pass a second arg here - that's a folder override, not a filename.
        return fileSaver.add(file);
    }

    private tryDeleteImage(fileName: string): void {
        try {
            const filePath = fileSaver.getFilePath(fileName);
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.warn("Could not delete image " + fileName + ":", err);
        }
    }
}

export const adminVacationService = new AdminVacationService();
