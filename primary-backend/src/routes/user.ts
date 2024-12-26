import { Request, Response, Router } from 'express'
import { authMiddleware } from '../middleware'
import { SigninSchema, SignupSchema } from '../types'
import { prismaClient } from '../db'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

const router = Router()

// @ts-ignore
router.post('/signup', async (req, res) => {
  const body = req.body
  const parsedData = SignupSchema.safeParse(body)
  if (!parsedData.success) {
    return res.status(422).json({
      message: 'invalid inputs',
    })
  }

  const userExist = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  })

  if (userExist) {
    return res.status(403).json({
      message: 'User already exists',
    })
  }

  await prismaClient.user.create({
    data: {
      email: parsedData.data.email,
      // TODO: Password Hashing
      password: parsedData.data.password,
      name: parsedData.data.name,
    },
  })

  //send email

  return res.json({
    message: 'Please verify your account by checking your email',
  })
})

// @ts-ignore
router.post('/signin', async (req, res) => {
  const body = req.body
  const parsedData = SigninSchema.safeParse(body)
  if (!parsedData.success) {
    return res.status(422).json({
      message: 'invalid inputs',
    })
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
      password: parsedData.data.password,
    },
  })

  if (!user) {
    return res.status(403).json({
      message: "You don't have an account, please signup.",
    })
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    JWT_SECRET
  )

  res.json({
    token: token,
  })
})

// @ts-ignore
router.post('/user', authMiddleware, async (req, res) => {
  // TODO: Fix Type
  // @ts-ignore
  const id = req.id
  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  })

  return res.json({
    user
  })
})

export const userRouter = router
