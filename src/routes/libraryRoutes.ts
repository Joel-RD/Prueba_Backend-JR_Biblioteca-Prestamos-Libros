
import express from 'express';
import booksRepository from '../repositories/taskRepository.js'

const router = express.Router();

router.post('/books', (req, res) => {
    booksRepository.create_book(req, res)
} )

router.post('/user', (req, res) => {
    booksRepository.create_user(req, res)
})

router.post('/borrow', (req, res) => {
    booksRepository.Creating_borrow(req, res)
})

router.get('/user/:id/borrow', (req, res) => {
    booksRepository.Borrow_user_id(req, res)
})

export default router;
