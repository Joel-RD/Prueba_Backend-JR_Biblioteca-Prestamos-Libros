CREATE TABLE room_books (
    books_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    author VARCHAR(50) NOT NULL,
    age_publication VARCHAR(4) NOT NULL,
    count INTEGER,
    status TEXT NOT NULL CHECK(status IN ('available','borrowed')) DEFAULT 'available'
);

CREATE TABLE users_authentication (
    users_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    books_id INTEGER,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (books_id) REFERENCES room_books(books_id)
);

CREATE TABLE borrow_books (
    borrow_id SERIAL PRIMARY KEY,
    users_id INTEGER NOT NULL,
    books_id INTEGER NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP,
    FOREIGN KEY (users_id) REFERENCES users_authentication(users_id),
    FOREIGN KEY (books_id) REFERENCES room_books(books_id)
);

