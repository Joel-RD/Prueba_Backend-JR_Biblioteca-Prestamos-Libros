import { Response, Request } from 'express'
import { query, transaction } from '../models/database.js'
import { hashPassword } from '../utils/password.js'
import { ApiError } from '../utils/apiError.js'

const MAX_ACTIVE_LOANS = 3

export const createBook = async (req: Request, res: Response) => {
    const { title, author, publicationYear } = req.body

    const existingBook = await query(
        'select * from books where title = $1;',
        [title]
    )

    if ((existingBook?.rowCount ?? 0) > 0) {
        throw new ApiError(409, 'The book already exists')
    }

    await query(
        'insert into books (title, author, publication_year) values ($1, $2, $3);',
        [title, author, publicationYear]
    );

    res.status(201).json('Added book')
}

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    const existingUser = await query(
        'select email from users where email = $1;',
        [email]
    )

    if ((existingUser?.rowCount ?? 0) > 0) {
        throw new ApiError(409, 'The user already exists')
    }

    const passwordHash = await hashPassword(password)
    await query(
        'insert into users (name, email, password) values ($1, $2, $3);',
        [name, email, passwordHash]
    );

    res.status(201).json('User created')
}

export const registerLoan = async (req: Request, res: Response) => {
    const { bookTitle, email } = req.body

    await transaction(async (client) => {
        const existingUser = await client.query(
            'select * from users where email = $1;',
            [email]
        )

        if ((existingUser?.rowCount ?? 0) < 1) {
            throw new ApiError(404, 'User not found, please register')
        }

        const bookRecord = await client.query(
            'select * from books where title = $1 for update;',
            [bookTitle]
        )

        if ((bookRecord?.rowCount ?? 0) < 1) {
            throw new ApiError(404, 'Book not found')
        }

        if (bookRecord?.rows[0].status !== 'available') {
            throw new ApiError(409, 'The book is currently on loan')
        }

        const userId = existingUser?.rows[0].id
        const bookId = bookRecord?.rows[0].id

        const activeLoansResult = await client.query(
            `SELECT COUNT(*)
             FROM loans
             WHERE user_id = $1 AND return_date IS NULL;`,
            [userId]
        )

        const activeLoanCount = parseInt(activeLoansResult?.rows[0].count)
        if (activeLoanCount >= MAX_ACTIVE_LOANS) {
            throw new ApiError(403, 'User already has 3 borrowed books')
        }

        await client.query(
            'insert into loans (user_id, book_id) values ($1, $2);',
            [userId, bookId]
        )

        await client.query(
            'update books set status = $1 where id = $2;',
            ['borrowed', bookId]
        )
    })

    res.status(201).json('The book is added from library')
}

export const returnBook = async (req: Request, res: Response) => {
    const { bookTitle, email } = req.body

    await transaction(async (client) => {
        const existingUser = await client.query(
            'select * from users where email = $1;',
            [email]
        )

        if ((existingUser?.rowCount ?? 0) < 1) {
            throw new ApiError(404, 'User not found, please register')
        }

        const activeLoanResult = await client.query(
            `select l.id as loan_id, l.book_id
             from loans l
             join books b on l.book_id = b.id
             join users u on l.user_id = u.id
             where u.email = $1 and b.title = $2 and l.return_date is null
             for update of l;`,
            [email, bookTitle]
        )

        if ((activeLoanResult?.rowCount ?? 0) < 1) {
            throw new ApiError(404, 'No active loan found for this book')
        }

        const loanId = activeLoanResult?.rows[0].loan_id
        const bookId = activeLoanResult?.rows[0].book_id

        await client.query(
            'update loans set return_date = now() where id = $1;',
            [loanId]
        )

        await client.query(
            'update books set status = $1 where id = $2;',
            ['available', bookId]
        )
    })

    res.status(200).json('The book was returned successfully')
}

export const getActiveLoansByUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)

    const existingUser = await query(
        'select * from users where id = $1;',
        [userId]
    )

    if ((existingUser?.rowCount ?? 0) < 1) {
        throw new ApiError(404, 'User not found, please register')
    }

    const activeLoans = await query(
        `select u.name, u.email, b.title, b.author, b.status
         from users u
         join loans l on u.id = l.user_id
         join books b on l.book_id = b.id
         where u.id = $1 and l.return_date is null;`,
        [userId]
    )

    res.status(200).json(activeLoans?.rows ?? [])
}