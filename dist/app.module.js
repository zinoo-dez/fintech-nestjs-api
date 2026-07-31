"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const redis_module_1 = require("./modules/redis/redis.module");
const queues_module_1 = require("./modules/queues/queues.module");
const events_module_1 = require("./modules/events/events.module");
const seats_module_1 = require("./modules/seats/seats.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const seed_service_1 = require("./database/seed.service");
const event_entity_1 = require("./modules/events/entities/event.entity");
const seat_entity_1 = require("./modules/seats/entities/seat.entity");
const user_entity_1 = require("./modules/users/entities/user.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            queues_module_1.QueuesModule,
            typeorm_1.TypeOrmModule.forFeature([event_entity_1.Event, seat_entity_1.Seat, user_entity_1.User]),
            events_module_1.EventsModule,
            seats_module_1.SeatsModule,
            bookings_module_1.BookingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map