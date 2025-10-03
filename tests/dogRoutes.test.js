process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Dog = require("../models/DogModel");
const mongoose = require("mongoose");
const User = require("../models/UserModel");

let authToken;
let testUser;

beforeAll(async () => {
    await db.connectDb();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
  testUser = { username: "testuser", password: "Test1234!" };
  await new User(testUser).save();

  // Log in to get cookie
  const res = await request(app).post("/login").send(testUser);
  authCookie = res.headers['set-cookie']; // store cookie for auth
});

afterEach(async () => {
  await Dog.deleteMany({});
  await User.deleteMany({});
});


describe("Get new dog form route", () => {

    test("Get /newdog should render new dog form (authenticated)", async () => {
        const res = await request(app).get("/dogs/newdog");
        expect(res.status).toBe(200);
        expect(res.text).toMatch(/Add new dog/i);
    });

});

describe("Create new dog route", () => {
      test("POST /newdog should create a new dog (authenticated)", async () => {
    const res = await request(app)
      .post("/dogs/newdog")
      .set("Cookie", authCookie)
      .send({ name: "Rex", description: "Friendly dog" });

    // Since controller redirects
    expect(res.status).toBe(302); // When you do a redirect, the status code is 302. When we create a dog successfully, we redirect to /dogs
    expect(res.headers.location).toBe("/dogs"); //When you do a res.redirect, the location header contains the URL to which the client is redirected

    const dogInDb = await Dog.findOne({ name: "Rex" }); // Verify dog is in DB
    expect(dogInDb).not.toBeNull(); // Check that dog was created
    expect(dogInDb.owner.toString()).toBeDefined(); // Check that owner field is set
  });

  test ("Post /newdog with missing description or name should return 400", async () => {
    const res = await request(app)
      .post("/dogs/newdog")
      .set("Cookie", authCookie)
      .send({ name: "", description: "Friendly dog" });
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/Name and description are required/i);
  });

     test("POST /newdog without authentication should fail", async () => {
    const res = await request(app)
      .post("/dogs/newdog")
      .send({ name: "Rex", description: "Friendly dog" });

    expect(res.status).toBe(401); // requiresAuth middleware blocks unauthenticated access since there is no cookie
  });

});

describe("Render dog list route", () => {
    test("Get /dogs should return list of dogs", async () => {
        const res = await request(app).get("/dogs");
        expect(res.status).toBe(200);
        expect(res.text).toMatch(/dog list/i); // Assuming the rendered page contains the word "dogs"
    });

    test("Get /dogs handles errors", async () => {
  // Make Dog.find throw an error
  jest.spyOn(Dog, "find").mockImplementation(() => {
    throw new Error("Database failure");
  });

  const res = await request(app).get("/dogs");

  expect(res.status).toBe(500); // generic server error passed to error handler
  expect(res.text).toMatch(/Database failure/i); // the error message should appear in the HTML

  Dog.find.mockRestore();
});


describe("Testing getAdopt route", () => {
  let testDog;

  beforeEach(async () => {
    
    await User.deleteMany({});
    await Dog.deleteMany({});

    const userDoc = await new User(testUser).save();

    const res = await request(app).post("/login").send(testUser);
    authCookie = res.headers['set-cookie'];

    
    testDog = await new Dog({ name: "Buddy", description: "Some dog I've met before", owner: userDoc._id }).save();
  });

  afterEach(async () => {
    await Dog.deleteMany({});
  });

  test("GET /:id/adoptDogForm should render adopt form for existing dog", async () => {
    const res = await request(app)
      .get(`/dogs/${testDog._id}/adoptDogForm`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/adopt/i); // checks the adopt form rendered
    expect(res.text).toMatch(/Buddy/i); // checks dog info appears
  });

  test("GET /:id/adoptDogForm should return 404 if dog not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/dogs/${fakeId}/adoptDogForm`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/Dog not found/i);
  });
});



    
  });