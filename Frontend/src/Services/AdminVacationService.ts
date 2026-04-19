import type { VacationModel } from "../Models/VacationModel";
import { appConfig } from "../Utils/AppConfig";
import { http } from "./HttpService";

export interface VacationFormValues {
    destination: string;
    description: string;
    continent: string;
    startDate: string;
    endDate: string;
    price: number;
    image?: FileList;
}

class AdminVacationService {

    public async create(values: VacationFormValues): Promise<VacationModel> {
        const form = this.toFormData(values, true);
        return http.post<VacationModel>(appConfig.adminUrls.create, form, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }

    public async update(id: string, values: VacationFormValues): Promise<VacationModel> {
        const form = this.toFormData(values, false);
        return http.put<VacationModel>(appConfig.adminUrls.update(id), form, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }

    public async remove(id: string): Promise<void> {
        await http.delete<void>(appConfig.adminUrls.remove(id));
    }

    private toFormData(values: VacationFormValues, imageRequired: boolean): FormData {
        const fd = new FormData();
        fd.append("destination", values.destination);
        fd.append("description", values.description);
        fd.append("continent", values.continent);
        fd.append("startDate", values.startDate);
        fd.append("endDate", values.endDate);
        fd.append("price", String(values.price));

        if (values.image && values.image.length > 0) {
            fd.append("image", values.image[0]);
        } else if (imageRequired) {
            throw new Error("An image is required.");
        }
        return fd;
    }
}

export const adminVacationService = new AdminVacationService();
