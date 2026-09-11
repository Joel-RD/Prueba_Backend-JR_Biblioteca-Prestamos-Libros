import request from "supertest";
import { jest } from "@jest/globals";

const query = jest.fn();
const transaction = async (fn) => fn({ query });

const hashPassword = jest.fn();
const isStrongPassword = jest.fn();

// Mock de dependencias
jest.unstable_mockModule("../dist/utils/password.js", () => ({
  hashPassword,
  verifyPassword: jest.fn(),
  isStrongPassword,
}));

// Mockear el módulo antes de importar app
jest.unstable_mockModule("../dist/models/database.js", () => ({
    query,
    transaction,
    pool: {},
}));

// Importa app después de mockear
const { default: app } = await import("../dist/app.js");

describe("POST /books", () => {
    afterEach(() => jest.clearAllMocks());

    it("should create book (title, author, publicationYear)", async () => {
        // Simula que el libro NO existe
        query.mockResolvedValueOnce({ rowCount: 0 });

        // Simula la inserción
        query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .post('/books')
            .send({ title: "Book 1", author: "Eudy Joel", publicationYear: "2025" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual("Added book");
    });

    it("It should give an error because the book already exists.", async () => {
        query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .post('/books')
            .send({ title: "Book 1", author: "Eudy Joel", publicationYear: "2025" });

        expect(response.status).toBe(409)
        expect(response.body).toEqual({ error: "The book already exists" })
    })

    it("It should give an error if values are incomplete.", async () => {
        const response = await request(app)
            .post('/books')
            .send({});

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: "title: Title is required" })
    })

    it("It should give an error if the publication year is invalid.", async () => {
        const response = await request(app)
            .post('/books')
            .send({ title: "Book 1", author: "Eudy Joel", publicationYear: "20" });

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: "publicationYear: Invalid publication year" })
    })
});

describe("POST /user", () => {
  afterEach(() => jest.clearAllMocks());

  it("should create user", async () => {
    isStrongPassword.mockReturnValue(true);
    query.mockResolvedValueOnce({ rowCount: 0 }); // no existe
    hashPassword.mockResolvedValue("hashed_pw");
    query.mockResolvedValueOnce({ rowCount: 1 }); // inserción

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "Pass@1234" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual("User created");
  });

  it("should fail if values are incomplete", async () => {
    const res = await request(app).post("/user").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "name: Name is required" });
  });

  it("should fail if password is insecure", async () => {
    isStrongPassword.mockReturnValue(false);

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error:
        "password: The password must be 8 characters, 1 special character, 1 uppercase letter and 1 lowercase letter",
    });
  });

  it("should fail if user already exists", async () => {
    isStrongPassword.mockReturnValue(true);
    query.mockResolvedValueOnce({ rowCount: 1 }); // ya existe

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "Pass@1234" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "The user already exists" });
  });

});

describe("POST /borrow", () => {
  afterEach(() => jest.clearAllMocks());

  it("should fail with incomplete values", async () => {
    const res = await request(app).post("/borrow").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "bookTitle: Title is required" });
  });

  it("should fail if user not registered", async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // usuario no existe
    const res = await request(app)
      .post("/borrow")
      .send({ bookTitle: "Book 10", email: "user@gmail.com" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found, please register" });
  });

  it("should fail if book not found", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }); // user existe
    query.mockResolvedValueOnce({ rowCount: 0 }); // libro no existe

    const res = await request(app)
      .post("/borrow")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Book not found" });
  });

  it("should fail if book is not available", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }); // user existe
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, status: "borrowed" }],
    }); // libro ocupado

    const res = await request(app)
      .post("/borrow")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "The book is currently on loan" });
  });

  it("should fail if user already has 3 borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, status: "available" }],
    });
    query.mockResolvedValueOnce({ rows: [{ count: "3" }] }); // ya tiene 3 préstamos

    const res = await request(app)
      .post("/borrow")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "User already has 3 borrowed books" });
  });

  it("should borrow a book", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, status: "available" }],
    });
    query.mockResolvedValueOnce({ rows: [{ count: "0" }] }); // 0 préstamos activos
    query.mockResolvedValueOnce({ rowCount: 1 }); // insert borrow
    query.mockResolvedValueOnce({ rowCount: 1 }); // update status

    const res = await request(app)
      .post("/borrow")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual("The book is added from library");
  });
});

describe("POST /return", () => {
  afterEach(() => jest.clearAllMocks());

  it("should fail with incomplete values", async () => {
    const res = await request(app).post("/return").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "bookTitle: Title is required" });
  });

  it("should fail if user not registered", async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // usuario no existe
    const res = await request(app)
      .post("/return")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found, please register" });
  });

  it("should fail if there is no active loan for the book", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    query.mockResolvedValueOnce({ rowCount: 0 }); // sin préstamo activo

    const res = await request(app)
      .post("/return")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "No active loan found for this book" });
  });

  it("should return a book", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ loan_id: 1, book_id: 1 }],
    });
    query.mockResolvedValueOnce({ rowCount: 1 }); // update loans
    query.mockResolvedValueOnce({ rowCount: 1 }); // update books

    const res = await request(app)
      .post("/return")
      .send({ bookTitle: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual("The book was returned successfully");
  });
});

describe("General error handling", () => {
  afterEach(() => jest.clearAllMocks());

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown/route");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Route not found" });
  });

  it("should return 500 on unexpected error", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app)
      .post("/books")
      .send({ title: "Book 1", author: "Eudy Joel", publicationYear: "2025" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
    errorSpy.mockRestore();
  });
});

describe("GET /user/:id/borrow", () => {
  afterEach(() => jest.clearAllMocks());

  it("should fail if param is missing", async () => {
    const res = await request(app).get("/user//borrow");
    expect(res.status).toBe(404);
  });

  it("should fail if param is not number", async () => {
    const res = await request(app).get("/user/abc/borrow");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "id: Invalid id param" });
  });

  it("should fail if user not found", async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // user no existe
    const res = await request(app).get("/user/1/borrow");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found, please register" });
  });

  it("should return empty list when user has no borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1 }); // user existe
    query.mockResolvedValueOnce({ rowCount: 0 }); // sin préstamos

    const res = await request(app).get("/user/1/borrow");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1 }); // user existe
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ name: "Pepe", email: "test@mail.com", title: "Book 1", author: "Eudy", status: "borrowed" }],
    });

    const res = await request(app).get("/user/1/borrow");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { name: "Pepe", email: "test@mail.com", title: "Book 1", author: "Eudy", status: "borrowed" },
    ]);
  });
});