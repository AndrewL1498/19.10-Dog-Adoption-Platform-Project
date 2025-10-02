process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

console.log("Test DB URI:", process.env.MONGODB_URI_TEST);

let testUser;

beforeAll(async () => {
    await db.connectDb();
});

afterAll(async () => {
    // Optional: drop test DB
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Auth routes", () => {

beforeEach(async () => {
    testUser = { username: "testuser", password: "Test1234!" };
});

afterEach(async () => {
    // Clear the users collection after each test
    await User.deleteMany({});
});

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
  jest.spyOn(User.prototype, "save").mockImplementation(() => { //User.prototype is saying for any instance of User that is created, mock the save method, and when it's called, it will throw an error. SpyOn is used to monitor calls to the method, while mockImplementation replaces its functionality.
    throw new Error("Database is down"); // Simulate a database error
  });

  // Simulate a signup request while jest.spyOn is waiting to throw an error
  const res = await request(app)
    .post("/signup")
    .send({ username: "newuser", password: "Test1234!" });

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Internal server error");

  // Restore original implementation so other tests aren't affected
  User.prototype.save.mockRestore();
 });

});


describe("Login route", () => {

  beforeEach(async () => {
    // This runs before each test inside this describe block
    await new User({ username: "testuser", password: "Test1234!" }).save(); // saves new user to the test database so we can test login
  });

    afterEach(async () => {
    // This runs after each test inside this describe block
    await User.deleteMany({});
  });

  test("POST /login with correct credentials should succeed", async () => {
  const res = await request(app).post("/login").send(testUser);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Login successful");
  expect(res.headers['set-cookie']).toBeDefined(); // Check if cookie is set

  const cookie = res.headers['set-cookie'][0];
  expect(cookie).toMatch(/token=/); // The cookie contains your JWT
  expect(cookie).toMatch(/HttpOnly/); // It's HttpOnly for security

});

test("POST /login with incorrect password should return 401", async () => {
  const res = await request(app).post("/login").send({ username: "testuser", password: "WrongPass!" });
  expect(res.status).toBe(401);
  expect(res.body.error).toBe("Invalid username or password");
});

test("POST /login triggers internal server error", async () => {
  // Make User.findOne throw an error
  jest.spyOn(User, "findOne").mockImplementation(() => {
    throw new Error("Internal server error");
  });

  const res = await request(app).post("/login").send(testUser);

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Internal server error");

  // Restore original implementation
  User.findOne.mockRestore();
});



});



