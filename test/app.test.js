import request from "supertest";
import { jest } from "@jest/globals";

const query = jest.fn();

const hashing_password = jest.fn();
const isSegurePassword = jest.fn();

// Mock de dependencias
jest.unstable_mockModule("../dist/src/utils/hashin_pw.js", () => ({
  hashing_password,
  verify_password: jest.fn(),
  isSegurePassword,
}));

// Mockear el módulo antes de importar app
jest.unstable_mockModule('../dist/src/models/db_conecction.js', () => ({
    query
}));

// Importa app después de mockear
const { default: app } = await import("../dist/src/app.js");

describe("POST /books", () => {
    it("should create book (title, author, age_publication)", async () => {
        // Simula que el libro NO existe
        query.mockResolvedValueOnce({ rowCount: 0 });

        // Simula la inserción
        query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .post('/books')
            .send({ title: "Book 1", author: "Eudy Joel", age_publication: "2025" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual("Added book");
    });

    it("It should give an error because the book already exists.", async () => {
        query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app)
            .post('/books')
            .send({ title: "Book 1", author: "Eudy Joel", age_publication: "2025" });

        expect(response.status).toBe(409)
        expect(response.body).toEqual("The book exits")
    })

    it("It should give an error because the book already exists.", async () => {
        query.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .post('/books')
            .send({});

        expect(response.status).toBe(400)
        expect(response.body).toEqual("Incomplete values")
    })
});

describe("👤 POST /user", () => {
  afterEach(() => jest.clearAllMocks());

  it("✅ should create user", async () => {
    isSegurePassword.mockReturnValue(true);
    query.mockResolvedValueOnce({ rowCount: 0 }); // no existe
    hashing_password.mockResolvedValue("hashed_pw");
    query.mockResolvedValueOnce({ rowCount: 1 }); // inserción

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "Pass@1234" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual("User created");
  });

  it("🚫 should fail if values are incomplete", async () => {
    const res = await request(app).post("/user").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual("Incomplete values");
  });

  it("🚫 should fail if password is insecure", async () => {
    isSegurePassword.mockReturnValue(false);

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      "The password must be 8 characters, 1 special character, 1 uppercase letter and 1 lowercase letter"
    );
  });

  it("🚫 should fail if user already exists", async () => {
    isSegurePassword.mockReturnValue(true);
    query.mockResolvedValueOnce({ rowCount: 1 }); // ya existe

    const res = await request(app)
      .post("/user")
      .send({ name: "Pepe", email: "test@mail.com", password: "Pass@1234" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual("The user exits");
  });

});

describe("📖 POST /borrow", () => {
  afterEach(() => jest.clearAllMocks());

  it("🚫 should fail with incomplete values", async () => {
    const res = await request(app).post("/borrow").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual("Incomplete values");
  });

  it("🚫 should fail if user not registered", async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // usuario no existe
    const res = await request(app)
      .post("/borrow")
      .send({ title_book: "Book 10", email: "user@gmail.com" });
    expect(res.status).toBe(404);
  });

  it("🚫 should fail if book not found", async () => { 
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ users_id: 1 }] }); // user existe
    query.mockResolvedValueOnce({ rowCount: 0 }); // libro no existe

    const res = await request(app)
      .post("/borrow")
      .send({ title_book: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual("Book not found");
  });

  it("🚫 should fail if book is not available", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ users_id: 1 }] }); // user existe
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ books_id: 1, status: "borrowed" }],
    }); // libro ocupado

    const res = await request(app)
      .post("/borrow")
      .send({ title_book: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(417);
    expect(res.body).toEqual("The book is currently on loan");
  });

  it("🚫 should fail if user already has 3 borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ users_id: 1 }] });
    query.mockResolvedValueOnce({
      rowCount: 1, 
      rows: [{ books_id: 1, status: "available" }],
    });
    query.mockResolvedValueOnce({ rows: [{ count: "3" }] }); // ya tiene 3 préstamos

    const res = await request(app)
      .post("/borrow")
      .send({ title_book: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual("User already has 3 borrowed books");
  });

  it("✅ should borrow a book", async () => {
    query.mockResolvedValueOnce({ rowCount: 1, rows: [{ users_id: 1 }] });
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ books_id: 1, status: "available" }],
    });
    query.mockResolvedValueOnce({ rows: [{ count: "0" }] }); // 0 préstamos activos
    query.mockResolvedValueOnce({ rowCount: 1 }); // insert borrow
    query.mockResolvedValueOnce({ rowCount: 1 }); // update status

    const res = await request(app)
      .post("/borrow")
      .send({ title_book: "Book 1", email: "user@mail.com" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual("The book is added from library");
  });
});

describe("🔎 GET /user/:id/borrow", () => {
  afterEach(() => jest.clearAllMocks());

  it("🚫 should fail if param is missing", async () => {
    const res = await request(app).get("/user//borrow");
    expect(res.status).toBe(404);
  });

  it("🚫 should fail if param is not number", async () => {
    const res = await request(app).get("/user/abc/borrow");
    expect(res.status).toBe(417);
    expect(res.body).toEqual("params not found, please insert valid param");
  });

  it("🚫 should fail if user not found", async () => {
    query.mockResolvedValueOnce({ rowCount: 0 }); // user no existe
    const res = await request(app).get("/user/1/borrow");
    expect(res.status).toBe(404);
    expect(res.body).toEqual("User not found, please register");
  });

  it("🚫 should fail if user has no borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1 }); // user existe
    query.mockResolvedValueOnce({ rowCount: 0 }); // sin préstamos

    const res = await request(app).get("/user/1/borrow");
    expect(res.status).toBe(400);
    expect(res.body).toEqual("The bookstore is empty");
  });

  it("✅ should return borrowed books", async () => {
    query.mockResolvedValueOnce({ rowCount: 1 }); // user existe
    query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ name: "Pepe", email: "test@mail.com", title: "Book 1", author: "Eudy", status: "borrowed" }],
    });

    const res = await request(app).get("/user/1/borrow");

    expect(res.status).toBe(201);
    expect(res.body).toEqual([
      { name: "Pepe", email: "test@mail.com", title: "Book 1", author: "Eudy", status: "borrowed" },
    ]);
  });
});   