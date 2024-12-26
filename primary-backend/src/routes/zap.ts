import { Router } from 'express'
import { authMiddleware } from '../middleware'

const router = Router()

router.post('/', (req, res) => {
  console.log('create a zap')
})

router.get('/signin', (req, res) => {
  console.log('zap handler')
})

router.get('/:zapId', (req, res) => {
  console.log('zap')
})

export const zapRouter = router
