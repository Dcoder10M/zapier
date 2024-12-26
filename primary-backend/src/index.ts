import express from 'express'
import { userRouter } from './routes/user'
import { zapRouter } from './routes/zap'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/v1/user', userRouter)
app.use('/api/v1/zap', zapRouter)

app.listen(3333, () => {
  console.log('Listening on port 3333')
})