import { z, type ZodTypeAny } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from './apiError.js';
import { isStrongPassword } from './password.js';

export const bookSchema = z.object({
  title: z.string({ message: 'Title is required' }).min(1, 'Title is required'),
  author: z.string({ message: 'Author is required' }).min(1, 'Author is required'),
  publicationYear: z
    .string({ message: 'Publication year is required' })
    .regex(/^\d{4}$/, 'Invalid publication year'),
});

export const userSchema = z.object({
  name: z.string({ message: 'Name is required' }).min(1, 'Name is required'),
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .refine(isStrongPassword, {
      message: 'The password must be 8 characters, 1 special character, 1 uppercase letter and 1 lowercase letter',
    }),
});

export const borrowSchema = z.object({
  bookTitle: z.string({ message: 'Title is required' }).min(1, 'Title is required'),
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
});

export const userIdParamSchema = z.object({
  id: z
    .string({ message: 'Invalid id param' })
    .regex(/^\d{1,10}$/, 'Invalid id param'),
});

const formatIssues = (issues: z.ZodIssue[]) => {
  const [first] = issues;
  return `${first.path.join('.') || 'request'}: ${first.message}`;
};

export const validate =
  (schema: ZodTypeAny, source: 'body' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result =
      source === 'params'
        ? schema.safeParse(req.params)
        : schema.safeParse(req.body);

    if (!result.success) {
      return next(new ApiError(400, formatIssues(result.error.issues)));
    }

    if (source === 'params') {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };