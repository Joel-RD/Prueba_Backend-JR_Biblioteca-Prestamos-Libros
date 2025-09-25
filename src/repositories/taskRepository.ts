
import { Response, Request } from 'express'
import { Creating_books, Creating_users, Borrow_Register, User_borrowed_id } from '../controllers/books_libray_consult.js'

class booksRepository {
    async create_book(req: Request, res: Response) {
        Creating_books(req, res)
    }

    async create_user (req: Request, res: Response) {
        Creating_users(req, res)
    }

    async Creating_borrow (req: Request, res: Response) {
        Borrow_Register(req, res)
    }

    async Borrow_user_id (req: Request, res: Response) {
        User_borrowed_id(req, res)
    }
}

export default new booksRepository;