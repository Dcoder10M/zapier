import { Trigger } from './../../../hooks/node_modules/.prisma/client/index.d';
import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().email().min(5),
  password: z.string().min(6),
  name: z.string().min(3),
})

export const SigninSchema = z.object({
  email: z.string().email().min(5),
  password: z.string().min(6),
})

export const ZapCreateSchema = z.object({
  triggerId:z.string(),
  triggerMetadata:z.any().optional(),
  action: z.array(z.object({
    availableActionId:z.string(),
    actionMetadata:z.any().optional()
  }))
})