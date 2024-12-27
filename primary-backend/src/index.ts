import express from 'express'
import { userRouter } from './routes/user'
import { zapRouter } from './routes/zap'
import cors from 'cors'
import { actionRouter } from './routes/action'
import { triggerRouter } from './routes/trigger'

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/v1/user', userRouter)
app.use('/api/v1/zap', zapRouter)
app.use('/api/v1/actions', actionRouter)
app.use('/api/v1/trigger', triggerRouter)

app.listen(3333, () => {
  console.log('Listening on port 3333')
})
