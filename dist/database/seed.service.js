"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const event_entity_1 = require("../modules/events/entities/event.entity");
const seat_entity_1 = require("../modules/seats/entities/seat.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
let SeedService = SeedService_1 = class SeedService {
    eventRepository;
    seatRepository;
    userRepository;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(eventRepository, seatRepository, userRepository) {
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.userRepository = userRepository;
    }
    async onApplicationBootstrap() {
        await this.seedData();
    }
    async seedData() {
        const eventCount = await this.eventRepository.count();
        if (eventCount > 0) {
            this.logger.log('Database already seeded. Skipping initial seeding.');
            return;
        }
        this.logger.log('🌱 Seeding initial sample event and seats...');
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = this.userRepository.create({
            email: 'test@gmail.com',
            passwordHash,
            name: 'Test Student',
        });
        await this.userRepository.save(user);
        const event = this.eventRepository.create({
            title: 'NestJS Concurrency & Performance Masterclass',
            description: 'Learn high-concurrency seat locking, BullMQ, and Redis',
            venue: 'Tech Convention Hall A',
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalSeats: 50,
        });
        const savedEvent = await this.eventRepository.save(event);
        const seats = [];
        for (let i = 1; i <= 50; i++) {
            seats.push({
                eventId: savedEvent.id,
                seatNumber: `A-${i}`,
                price: 50.0,
                status: seat_entity_1.SeatStatus.AVAILABLE,
            });
        }
        await this.seatRepository.save(seats);
        this.logger.log(`Seeding complete! Sample Event ID: ${savedEvent.id} with 50 seats.`);
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(seat_entity_1.Seat)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map