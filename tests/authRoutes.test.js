process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

let testUser;

beforeAll(async () => {
    await db.connectDb();
});

beforeEach(async () => {
    testUser = { username: "testuser", password: "Test1234!" };
});

afterEach(async () => {
    // Clear the users collection after each test
    await User.deleteMany({});
});

afterAll(async () => {
    // Optional: drop test DB
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Auth routes", () => {
  test("POST /signup should create a new user", async () => {
    const res = await request(app).post("/signup").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered successfully");

    const userInDb = await User.findOne({ username: testUser.username });
    expect(userInDb).not.toBeNull();
  });

    test("POST /signup with missing username should return 400", async () => {
    const res = await request(app).post("/signup").send({ username: "", password: "Test1234!" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Username and password are required");
  });


  test("POST /signup with existing username should return 409", async () => {
  // First, create the user
  await request(app).post("/signup").send({ username: "testuser", password: "Test1234!" });

  // Attempt to create the same user again
  const res = await request(app).post("/signup").send({ username: "testuser", password: "Test1234!" });

  expect(res.status).toBe(409);
  expect(res.body.error).toBe("Username already exists");
});

test("POST /signup with username too short triggers ValidationError", async () => {
  // This username is too short to satisfy Mongoose schema minlength
  const res = await request(app)
    .post("/signup")
    .send({ username: "ab", password: "Test1234!" });

  expect(res.status).toBe(400);
  // The error message comes from Mongoose validation
  expect(res.body.error).toMatch(/username.*at least 3 characters/i); 
});


test("POST /signup triggers internal server error", async () => {
  // Mock the save function to throw an error
  jest.spyOn(User.prototype, "save").mockImplementation(() => { //
    throw new Error("Database is down");
  });

  const res = await request(app)
    .post("/signup")
    .send({ username: "newuser", password: "Test1234!" });

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Internal server error");

  // Restore original implementation so other tests aren't affected
  User.prototype.save.mockRestore();
});



});



