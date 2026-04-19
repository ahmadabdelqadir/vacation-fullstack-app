import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { Continent, Role } from "../3-models/enums";
import { LikeModel } from "../3-models/like-model";
import { UserModel } from "../3-models/user-model";
import { VacationModel } from "../3-models/vacation-model";
import { cyber } from "./cyber";

function resolveSeedImagesDir(): string | null {
    // Candidate paths, in order of preference:
    // 1) Monorepo-local dev: Backend/src/2-utils -> ../../../Database/seed/images
    // 2) Packaged Docker image: seed images copied next to runtime assets.
    const candidates = [
        path.resolve(__dirname, "..", "..", "..", "Database", "seed", "images"),
        path.resolve(__dirname, "..", "1-assets", "seed-images")
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

/**
 * Idempotent seed. Runs on boot when a collection is empty. Anchored to
 * 2026-04-13 so the demo includes real past, active, and future vacations
 * for the required filters.
 */
class Seeder {

    private readonly seedImagesDir = resolveSeedImagesDir();
    private readonly runtimeImagesDir = path.resolve(__dirname, "..", "1-assets", "images");

    public async run(): Promise<void> {
        await this.ensureImagesOnDisk();
        await this.seedUsersIfEmpty();
        await this.seedVacationsIfEmpty();
        await this.seedLikesIfEmpty();
    }

    private ensureImagesOnDisk(): void {
        if (!fs.existsSync(this.runtimeImagesDir)) {
            fs.mkdirSync(this.runtimeImagesDir, { recursive: true });
        }
        if (!this.seedImagesDir) {
            console.warn("No seed images folder found - skipping image copy.");
            return;
        }
        const files = fs.readdirSync(this.seedImagesDir).filter(name => /^vacation-\d{2}\.(jpg|png|webp)$/i.test(name));
        for (const file of files) {
            const target = path.join(this.runtimeImagesDir, file);
            if (!fs.existsSync(target)) {
                fs.copyFileSync(path.join(this.seedImagesDir, file), target);
            }
        }
    }

    private async seedUsersIfEmpty(): Promise<void> {
        const count = await UserModel.estimatedDocumentCount();
        if (count > 0) return;

        const [adminPasswordHash, user1PasswordHash, user2PasswordHash] = await Promise.all([
            cyber.hash("admin1234"),
            cyber.hash("user1234"),
            cyber.hash("user1234")
        ]);

        const adminDoc = {
            firstName: "Ada",
            lastName: "Admin",
            email: "admin@vacations.com",
            passwordHash: adminPasswordHash,
            role: Role.Admin
        };
        const userDocs = [
            {
                firstName: "Uriel",
                lastName: "User",
                email: "user1@demo.com",
                passwordHash: user1PasswordHash,
                role: Role.User
            },
            {
                firstName: "Ursula",
                lastName: "User",
                email: "user2@demo.com",
                passwordHash: user2PasswordHash,
                role: Role.User
            }
        ];
        await UserModel.insertMany([adminDoc, ...userDocs]);
        console.log("Seeded users (admin + 2 demo users).");
    }

    private async seedVacationsIfEmpty(): Promise<void> {
        const count = await VacationModel.estimatedDocumentCount();
        if (count > 0) return;

        const seed = [
            // Past (3)
            {
                vacationCode: "VAC-0001",
                destination: "Paris, France",
                description:
                    "A week in the city of light. Historic neighborhoods, river cruises, and pastries that change your mood.",
                startDate: "2026-01-05",
                endDate: "2026-01-15",
                price: 1899,
                continent: Continent.Europe,
                imageFileName: "vacation-01.jpg"
            },
            {
                vacationCode: "VAC-0002",
                destination: "Rome, Italy",
                description:
                    "Ancient ruins, hand-rolled pasta, and evenings across Trastevere's cobblestones. Food, art, and centuries of stories.",
                startDate: "2026-02-10",
                endDate: "2026-02-20",
                price: 1749,
                continent: Continent.Europe,
                imageFileName: "vacation-02.jpg"
            },
            {
                vacationCode: "VAC-0003",
                destination: "Cairo, Egypt",
                description:
                    "Pyramids at golden hour, felucca rides on the Nile, and bustling bazaars loaded with spices and silver.",
                startDate: "2026-03-01",
                endDate: "2026-03-12",
                price: 1499,
                continent: Continent.Africa,
                imageFileName: "vacation-03.jpg"
            },
            // Active (3) - span 2026-04-13
            {
                vacationCode: "VAC-0004",
                destination: "Barcelona, Spain",
                description:
                    "Gaudí's architecture, tapas bars that never close, and beach sunsets framed by mountains.",
                startDate: "2026-04-05",
                endDate: "2026-04-18",
                price: 1599,
                continent: Continent.Europe,
                imageFileName: "vacation-04.jpg"
            },
            {
                vacationCode: "VAC-0005",
                destination: "Tokyo, Japan",
                description:
                    "Sushi counters, late-night ramen, neon alleys in Shinjuku, and serene temples a train ride away.",
                startDate: "2026-04-10",
                endDate: "2026-04-22",
                price: 2399,
                continent: Continent.Asia,
                imageFileName: "vacation-05.jpg"
            },
            {
                vacationCode: "VAC-0006",
                destination: "Rio de Janeiro, Brazil",
                description:
                    "Cable cars up Sugarloaf, samba on the beach, and views that justify every flight hour to get there.",
                startDate: "2026-04-01",
                endDate: "2026-04-25",
                price: 2099,
                continent: Continent.SouthAmerica,
                imageFileName: "vacation-06.jpg"
            },
            // Future (6)
            {
                vacationCode: "VAC-0007",
                destination: "Lisbon, Portugal",
                description:
                    "Tiled facades, tram 28, pastéis de nata, and the Atlantic glittering at the end of every street.",
                startDate: "2026-05-08",
                endDate: "2026-05-18",
                price: 1399,
                continent: Continent.Europe,
                imageFileName: "vacation-07.jpg"
            },
            {
                vacationCode: "VAC-0008",
                destination: "Reykjavik, Iceland",
                description:
                    "Geothermal lagoons, northern lights if you're lucky, and the kind of raw landscapes that reset your brain.",
                startDate: "2026-06-14",
                endDate: "2026-06-22",
                price: 2299,
                continent: Continent.Europe,
                imageFileName: "vacation-08.jpg"
            },
            {
                vacationCode: "VAC-0009",
                destination: "Cape Town, South Africa",
                description:
                    "Table Mountain, wine country an hour away, and some of the most beautiful coastline on earth.",
                startDate: "2026-07-20",
                endDate: "2026-07-31",
                price: 2599,
                continent: Continent.Africa,
                imageFileName: "vacation-09.jpg"
            },
            {
                vacationCode: "VAC-0010",
                destination: "Bali, Indonesia",
                description:
                    "Terraced rice fields, beach clubs at sunset, and temples hidden a few turns off the main road.",
                startDate: "2026-08-12",
                endDate: "2026-08-24",
                price: 1999,
                continent: Continent.Asia,
                imageFileName: "vacation-10.jpg"
            },
            {
                vacationCode: "VAC-0011",
                destination: "New York, USA",
                description:
                    "Skyline from the water, corner pizza slices, Broadway at night, and a museum for every mood.",
                startDate: "2026-10-05",
                endDate: "2026-10-13",
                price: 1899,
                continent: Continent.NorthAmerica,
                imageFileName: "vacation-11.jpg"
            },
            {
                vacationCode: "VAC-0012",
                destination: "Santorini, Greece",
                description:
                    "Whitewashed villages, caldera views that genuinely live up to the photos, and Aegean sunsets.",
                startDate: "2026-11-10",
                endDate: "2026-11-18",
                price: 1799,
                continent: Continent.Europe,
                imageFileName: "vacation-12.jpg"
            },
            // Additional 6 to fill a second page (9 more destinations so 18 total).
            // Past (1 more)
            {
                vacationCode: "VAC-0013",
                destination: "Banff, Canada",
                description:
                    "Turquoise lakes framed by jagged peaks, elk on the roadside, and silent hikes through spruce forests.",
                startDate: "2025-12-10",
                endDate: "2025-12-20",
                price: 2199,
                continent: Continent.NorthAmerica,
                imageFileName: "vacation-18.jpg"
            },
            // Active (1 more) - overlaps 2026-04-13
            {
                vacationCode: "VAC-0014",
                destination: "Maldives",
                description:
                    "Overwater villas, bioluminescent beaches, and reefs you can snorkel straight from your door.",
                startDate: "2026-04-08",
                endDate: "2026-04-20",
                price: 3499,
                continent: Continent.Asia,
                imageFileName: "vacation-17.jpg"
            },
            // Future (4 more)
            {
                vacationCode: "VAC-0015",
                destination: "Dubrovnik, Croatia",
                description:
                    "Stone-walled Old Town, Adriatic swims off the ramparts, and sunsets over terracotta rooftops.",
                startDate: "2026-06-05",
                endDate: "2026-06-14",
                price: 1599,
                continent: Continent.Europe,
                imageFileName: "vacation-16.jpg"
            },
            {
                vacationCode: "VAC-0016",
                destination: "Marrakech, Morocco",
                description:
                    "Souks that swallow whole afternoons, riad courtyards, tagines, and tea poured from impossible heights.",
                startDate: "2026-07-04",
                endDate: "2026-07-12",
                price: 1299,
                continent: Continent.Africa,
                imageFileName: "vacation-14.jpg"
            },
            {
                vacationCode: "VAC-0017",
                destination: "Sydney, Australia",
                description:
                    "Harbour ferries, coastal walks from Bondi to Coogee, and the Opera House lit up after dark.",
                startDate: "2026-09-15",
                endDate: "2026-09-25",
                price: 2899,
                continent: Continent.Oceania,
                imageFileName: "vacation-13.jpg"
            },
            {
                vacationCode: "VAC-0018",
                destination: "Kyoto, Japan",
                description:
                    "Thousands of vermilion torii gates, tea ceremonies in old wooden houses, and cherry blossoms everywhere in spring.",
                startDate: "2027-03-22",
                endDate: "2027-03-30",
                price: 2599,
                continent: Continent.Asia,
                imageFileName: "vacation-15.jpg"
            }
        ].map(vacation => ({ ...vacation, startDate: new Date(vacation.startDate), endDate: new Date(vacation.endDate) }));

        await VacationModel.insertMany(seed);
        console.log("Seeded " + seed.length + " vacations.");
    }

    private async seedLikesIfEmpty(): Promise<void> {
        const count = await LikeModel.estimatedDocumentCount();
        if (count > 0) return;

        const users = await UserModel.find({ role: Role.User }).lean();
        const vacations = await VacationModel.find().lean();
        if (users.length === 0 || vacations.length === 0) return;

        // Spread likes across 18 vacations so the chart has variety (some zeros included).
        const pattern: Array<{ destinationCode: string; likers: number[] }> = [
            { destinationCode: "VAC-0001", likers: [0] },    // Paris
            { destinationCode: "VAC-0002", likers: [1] },    // Rome
            // VAC-0003 (Cairo) intentionally zero to prove the chart handles zeros.
            { destinationCode: "VAC-0004", likers: [0, 1] }, // Barcelona
            { destinationCode: "VAC-0005", likers: [0, 1] }, // Tokyo - popular
            { destinationCode: "VAC-0006", likers: [0, 1] }, // Rio
            { destinationCode: "VAC-0007", likers: [0, 1] }, // Lisbon
            { destinationCode: "VAC-0008", likers: [0, 1] }, // Reykjavik
            { destinationCode: "VAC-0009", likers: [0] },    // Cape Town
            { destinationCode: "VAC-0010", likers: [0] },    // Bali
            { destinationCode: "VAC-0011", likers: [1] },    // New York
            { destinationCode: "VAC-0012", likers: [0, 1] }, // Santorini
            { destinationCode: "VAC-0013", likers: [0] },    // Banff
            { destinationCode: "VAC-0014", likers: [0, 1] }, // Maldives - popular
            { destinationCode: "VAC-0015", likers: [1] },    // Dubrovnik
            // VAC-0016 (Marrakech) zero
            { destinationCode: "VAC-0017", likers: [0, 1] }, // Sydney
            { destinationCode: "VAC-0018", likers: [0] }     // Kyoto
        ];

        const docs: { userId: Types.ObjectId; vacationId: Types.ObjectId }[] = [];
        for (const entry of pattern) {
            const vacation = vacations.find(candidate => candidate.vacationCode === entry.destinationCode);
            if (!vacation) continue;
            for (const idx of entry.likers) {
                const user = users[idx];
                if (!user) continue;
                docs.push({ userId: user._id as Types.ObjectId, vacationId: vacation._id as Types.ObjectId });
            }
        }
        if (docs.length === 0) return;
        await LikeModel.insertMany(docs);
        console.log("Seeded " + docs.length + " likes.");
    }
}

export const seeder = new Seeder();
