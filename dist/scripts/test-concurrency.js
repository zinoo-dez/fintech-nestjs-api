"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = 'http://localhost:3000/api/v1';
const CONCURRENT_REQUESTS_COUNT = 100;
async function runConcurrencyTest() {
    console.log('========================================================================');
    console.log('🚀 STRESS TEST: SIMULTANEOUS HIGH-CONCURRENCY SEAT LOCKING TEST');
    console.log(`🎯 Testing ${CONCURRENT_REQUESTS_COUNT} simultaneous requests for the EXACT same seat`);
    console.log('========================================================================\n');
    try {
        console.log('1️⃣ Fetching valid test users...');
        const usersResponse = await axios_1.default.get(`${API_BASE_URL}/users`);
        if (!usersResponse.data || usersResponse.data.length === 0) {
            console.error('❌ No users found in database! Please run dev server to seed initial users.');
            process.exit(1);
        }
        const testUser = usersResponse.data[0];
        console.log(`   ✅ Test User: ${testUser.email} (ID: ${testUser.id})`);
        console.log('\n2️⃣ Fetching active events...');
        const eventsResponse = await axios_1.default.get(`${API_BASE_URL}/events`);
        if (!eventsResponse.data || eventsResponse.data.length === 0) {
            console.error('❌ No events found in database!');
            process.exit(1);
        }
        const testEvent = eventsResponse.data[0];
        console.log(`   ✅ Target Event: "${testEvent.title}" (ID: ${testEvent.id})`);
        console.log('\n3️⃣ Fetching seat layout for event...');
        const seatsResponse = await axios_1.default.get(`${API_BASE_URL}/events/${testEvent.id}/seats`);
        const availableSeats = seatsResponse.data.filter((s) => s.status === 'AVAILABLE');
        if (availableSeats.length === 0) {
            console.error('❌ No AVAILABLE seats found for this event! Resetting seed recommended.');
            process.exit(1);
        }
        const targetSeat = availableSeats[0];
        console.log(`   🎯 Target Seat: "${targetSeat.seatNumber}" (ID: ${targetSeat.id})`);
        console.log(`\n4️⃣ Firing ${CONCURRENT_REQUESTS_COUNT} concurrent requests to hold seat ${targetSeat.seatNumber}...`);
        const requests = Array.from({ length: CONCURRENT_REQUESTS_COUNT }, (_, index) => {
            return axios_1.default
                .post(`${API_BASE_URL}/seats/${targetSeat.id}/hold`, { userId: testUser.id })
                .then((res) => ({ status: res.status, data: res.data, userIndex: index + 1 }))
                .catch((err) => ({
                status: err.response ? err.response.status : 500,
                data: err.response ? err.response.data : err.message,
                userIndex: index + 1,
            }));
        });
        const results = await Promise.all(requests);
        const successCount = results.filter((r) => r.status === 200 || r.status === 201).length;
        const conflictCount = results.filter((r) => r.status === 409).length;
        const errorCount = results.filter((r) => r.status !== 200 && r.status !== 201 && r.status !== 409).length;
        console.log('\n========================================================================');
        console.log('📊 CONCURRENCY TEST RESULTS SUMMARY');
        console.log('========================================================================');
        console.log(`🟢 Successful Holds (200 OK)     : ${successCount}`);
        console.log(`🔴 Rejected Conflicts (409 Conflict) : ${conflictCount}`);
        console.log(`⚠️ Unexpected Errors (500 Error)   : ${errorCount}`);
        console.log('========================================================================\n');
        if (successCount === 1 && conflictCount === CONCURRENT_REQUESTS_COUNT - 1 && errorCount === 0) {
            console.log('🏆 VERIFICATION SUCCESSFUL!');
            console.log('✅ DOUBLE-BOOKING PREVENTED! Exactly 1 user held the seat, 99 were safely rejected.');
            console.log('✅ Redis Distributed Atomic Locking + DB Transaction performed flawlessly!');
        }
        else {
            console.error('❌ VERIFICATION FAILED! Double-booking or unexpected lock errors detected.');
        }
    }
    catch (err) {
        console.error('❌ Concurrency test script error:', err.message);
    }
}
runConcurrencyTest();
//# sourceMappingURL=test-concurrency.js.map