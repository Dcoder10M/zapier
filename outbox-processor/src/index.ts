import { PrismaClient } from '@prisma/client'
import { Kafka } from 'kafkajs'

const TOPIC_NAME = 'zapRunOutboxTopic'
const client = new PrismaClient()
const kafka = new Kafka({
  clientId: 'outbox-processor',
  brokers: ['localhost:9092'],
})
const producer = kafka.producer()

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  await producer.connect()

  while (1) {
    try {
      const pendingRows = await client.zapRunOutbox.findMany({
        where: {},
        take: 10,
      })

      if (pendingRows.length === 0) {
        await delay(1000)
        continue
      }

      await producer.send({
        topic: TOPIC_NAME,
        messages: pendingRows.map((row) => ({
          value: row.zapRunId,
        })),
      })

      await client.zapRunOutbox.deleteMany({
        where: {
          id: {
            in: pendingRows.map((row) => row.id),
          },
        },
      })
    } catch (error) {
      console.error('Error processing outbox messages:', error)
      await delay(1000)
    }
  }
}

async function shutdown() {
  console.log('Shutting down...')
  await producer.disconnect()
  await client.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main()
