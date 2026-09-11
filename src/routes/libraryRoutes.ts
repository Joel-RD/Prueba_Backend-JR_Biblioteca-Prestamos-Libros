import { Router } from 'express';
import {
  createBook,
  createUser,
  registerLoan,
  returnBook,
  getActiveLoansByUser,
} from '../controllers/libraryController.js';
import {
  bookSchema,
  userSchema,
  borrowSchema,
  userIdParamSchema,
  validate,
} from '../utils/validators.js';

const router = Router();

router.post('/books', validate(bookSchema), createBook);

router.post('/user', validate(userSchema), createUser);

router.post('/borrow', validate(borrowSchema), registerLoan);

router.post('/return', validate(borrowSchema), returnBook);

router.get('/user/:id/borrow', validate(userIdParamSchema, 'params'), getActiveLoansByUser);

export default router;