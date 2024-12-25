import { Kafka } from 'kafkajs'

const TOPIC_NAME = 'zapRunOutboxTopic'
const kafka = new Kafka({
  clientId: 'worker-processor',
  brokers: ['localhost:9092'],
})
const consumer = kafka.consumer({ groupId: 'main-worker' })

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  try {
    await consumer.connect()

    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          partition,
          offset: message.offset,
          value: message.value?.toString(),
        })

        //expensive op
        delay(2000)

        //manual acknowledgement
        await consumer.commitOffsets([
          {
            topic: TOPIC_NAME,
            partition: partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ])
      },
    })
  } catch (error) {
    console.error('Error processing kafka queue:', error)
    await shutdown()
  }
}

async function shutdown() {
  console.log('Shutting down...')
  await consumer.disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main()
