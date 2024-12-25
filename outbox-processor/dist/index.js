"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = 'zapRunOutboxTopic';
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092'],
});
const producer = kafka.producer();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.connect();
        while (1) {
            try {
                const pendingRows = yield client.zapRunOutbox.findMany({
                    where: {},
                    take: 10,
                });
                if (pendingRows.length === 0) {
                    yield delay(5000);
                    continue;
                }
                yield producer.send({
                    topic: TOPIC_NAME,
                    messages: pendingRows.map((row) => ({
                        value: row.zapRunId,
                    })),
                });
                yield client.zapRunOutbox.deleteMany({
                    where: {
                        id: {
                            in: pendingRows.map((row) => row.id),
                        },
                    },
                });
                yield delay(5000);
            }
            catch (error) {
                console.error('Error processing outbox messages:', error);
                yield shutdown();
            }
        }
    });
}
function shutdown() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Shutting down...');
        yield producer.disconnect();
        yield client.$disconnect();
        process.exit(0);
    });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
main();
