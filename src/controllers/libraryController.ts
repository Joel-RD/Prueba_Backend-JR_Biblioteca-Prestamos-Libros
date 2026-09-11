
import { Response, Request } from 'express'
import { query } from '../models/db_conecction.js'
import { hashing_password, verify_password, isSegurePassword } from '../utils/hashin_pw.js'

interface Books_Params {
    title: string;
    author: string;
    age_publication: string;
}

interface User_Params {
    name: string;
    email: string;
    password: string;
}

interface Title_Book {
    title_book: string;
    email: string;
}

interface Params_Id {
    id: string;
}

export const Creating_books = async (req: Request, res: Response) => {
    try {
        const { title, author, age_publication }: Books_Params = req.body

         if (!title || !author || !age_publication) {
            res.status(400).json('Incomplete values')
            return 
        }

        const exit_book = 'select * from room_books where title = $1;'
        const exist_book_result = await query(exit_book, [title])

        if (exist_book_result?.rowCount as number > 0) {
            return res.status(409).json("The book exits")
        }

        const consult = 'insert into room_books (title, author, age_publication) values ($1, $2, $3);'
        const result = await query(consult, [title, author, age_publication]);
        res.status(201).json("Added book");
    } catch (error) {
        res.status(500).json('Error creating book');
        throw error
    }
}

export const Creating_users = async (req: Request, res: Response) => {
    try {
        const { name, email, password }: User_Params = req.body;

        if (!name || !email || !password) {
            res.status(400).json('Incomplete values')
            return
        }

        if (!isSegurePassword(password)) {
            return res.status(400).json('The password must be 8 characters, 1 special character, 1 uppercase letter and 1 lowercase letter');
        }

        const user_exists_query = 'select email from users_authentication where email = $1;';
        const user_exists_result = await query(user_exists_query, [email]);

        if (user_exists_result?.rowCount == 1) {
            return res.status(409).json("The user exits");
        }

        const hash = await hashing_password(password);
        const insert_query = 'insert into users_authentication (name, email, password) values ($1, $2, $3);';
        await query(insert_query, [name, email, hash]);
        return res.status(201).json('User created');
    } catch (error) {
        console.log(error);
        res.status(500).json('Error creating user');
    }
}

export const Borrow_Register = async (req: Request, res: Response) => {
    try {
        const { title_book, email }: Title_Book = req.body;

         if (!title_book || !email) {
            res.status(400).json('Incomplete values')
            return
        }

        const user_exists_query = 'select * from users_authentication where email = $1;';
        const user_exists_result = await query(user_exists_query, [email]);
        if (user_exists_result?.rowCount as number < 1) {
            return res.status(401).json("Please register, not Unauthorized");
        }

        const title_exits = 'select * from room_books where title = $1;'
        const result = await query(title_exits, [title_book]);

        if (result?.rowCount as number < 1) {
            res.status(404).json('Book not found')
            return;
        }

        if (result?.rows[0].status !== 'available') {
            res.status(417).json('The book is currently on loan')
            return;
        }

        const user_id = user_exists_result?.rows[0].users_id;
        const book_id = result?.rows[0].books_id

        // Validar que el usuario no tenga ya 3 libros prestados activos (sin devolver)
        const count_borrowed_query = `
          SELECT COUNT(*) 
          FROM borrow_books 
          WHERE users_id = $1 AND return_date IS NULL;
        `;
        const count_result = await query(count_borrowed_query, [user_id]);
        const borrowed_count = parseInt(count_result?.rows[0].count);
        if (borrowed_count >= 3) {
            return res.status(403).json("User already has 3 borrowed books");
        }

        const borrowed_insert = 'insert into borrow_books (users_id, books_id) values ($1, $2);'
        const borrowed_result = query(borrowed_insert, [user_id, book_id]);

        //change the status of the book
        const change_status = 'update room_books set status = $1 where books_id = $2 ;'
        const change_status_params = query(change_status, ['borrowed', book_id])

        res.status(201).json('The book is added from library')
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const User_borrowed_id = async (req: Request, res: Response) => {
    try {
        const id_number = parseInt(req.params.id);

         if (!req.params.id) {
            return res.status(400).json("Incomplete values");
        }

        if (isNaN(id_number)) {
            return res.status(417).json("params not found, please insert valid param");
        }

        const user_exists_query = 'select * from users_authentication where users_id = $1;';
        const user_exists_result = await query(user_exists_query, [id_number]);
        if (user_exists_result?.rowCount as number < 1) {
            return res.status(404).json("User not found, please register");
        }

        const consutl_list_borrowed_book = 'select u.name, u.email, b.title, b.author, b.status from users_authentication u join borrow_books bb on u.users_id = bb.users_id join room_books b on bb.books_id = b.books_id where u.users_id = $1;'
        const consult_list_borrowed_book_result = await query(consutl_list_borrowed_book, [id_number])

        if (consult_list_borrowed_book_result?.rowCount as number < 1) {
            return res.status(400).json("The bookstore is empty")
        }
                
        res.status(201).json(consult_list_borrowed_book_result?.rows);
    } catch (error) {
        console.error(error);
        throw error

    }
}