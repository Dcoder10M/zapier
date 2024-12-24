import express from 'express'
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()
const app = express()
app.use(express.json())
// https://hooks.zapier.com/hooks/catch/21106715/2853mf9/

app.post('/hooks/catch/:userId/:zapId/', async (req, res) => {
  const userId = req.params.userId
  const zapId = req.params.zapId
  const metadata = req.body

  //storing in ZapRun and ZapRunOutbox
  await client.$transaction(async (tx) => {
    const createZapRun = await client.zapRun.create({
      data: {
        zapId: zapId,
        metadata: metadata,
      },
    })
    await client.zapRunOutbox.create({
      data: {
        zapRunId: createZapRun.id,
      },
    })
  })
  res.json({
    message: "Webhook received"
  })
})

app.listen(3000, () => {
  console.log('app listening on PORT 3000')
})
