process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Dog = require("../models/DogModel");
const mongoose = require("mongoose");
const User = require("../models/UserModel");

let authCookie;
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
  let testDog; //sets up a variable to hold a test dog

  beforeEach(async () => {
    
    await User.deleteMany({}); // Clear users to avoid duplicates
    await Dog.deleteMany({}); // Clear dogs to avoid duplicates

    const userDoc = await new User(testUser).save(); // Save test user to DB

    const res = await request(app).post("/login").send(testUser); // Log in to get cookie
    authCookie = res.headers['set-cookie']; // store cookie for auth

    
    testDog = await new Dog({ name: "Buddy", description: "Some dog I've met before", owner: userDoc._id }).save(); // Save a test dog to DB
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
    const fakeId = new mongoose.Types.ObjectId(); // creates a valid ObjectId that doesn't exist in DB
    const res = await request(app)
      .get(`/dogs/${fakeId}/adoptDogForm`)
      .set("Cookie", authCookie);

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/Dog not found/i);
  });
 });



describe("Adopt dog route", () => {
  let ownerUser, adopterUser, ownerCookie, adopterCookie, testDog;

  beforeEach(async () => {
    // Create owner and adopter users
    ownerUser = new User({ username: "ownerUser", password: "Password123!" });
    adopterUser = new User({ username: "adopterUser", password: "Password123!" });
    await ownerUser.save();
    await adopterUser.save();

    // Login both users to get cookies
    const ownerRes = await request(app).post("/login").send({
      username: "ownerUser",
      password: "Password123!",
    });
    ownerCookie = ownerRes.headers["set-cookie"];

    const adopterRes = await request(app).post("/login").send({
      username: "adopterUser",
      password: "Password123!",
    });
    adopterCookie = adopterRes.headers["set-cookie"];

    // Create a dog owned by the ownerUser
    testDog = await new Dog({
      name: "Max",
      description: "Loyal companion",
      owner: ownerUser._id,
    }).save();
  });

  test("POST /:id/adopt should let a different authenticated user adopt a dog", async () => {
    const res = await request(app)
      .post(`/dogs/${testDog._id}/adopt`)
      .set("Cookie", adopterCookie) // use adopter's cookie to authenticate the request
      .send({ thankYouMessage: "Thank you for the opportunity!" });

    expect(res.status).toBe(302); // 302 is a redirect status
    expect(res.headers.location).toBe("/dogs/dogsIHaveAdopted"); // should redirect to adopted dogs page

    const updatedDog = await Dog.findById(testDog._id); // Fetch the dog from the database to verify changes
    expect(updatedDog.adoptedBy.toString()).toBe(adopterUser._id.toString()); // Check adoptedBy is set correctly
    expect(updatedDog.status).toBe("Adopted"); // Check status is updated to 'Adopted'
    expect(updatedDog.thankYouMessage).toBe("Thank you for the opportunity!"); // Check thankYouMessage is saved
  });

  test("POST /:id/adopt should return 404 if dog not found", async () => {
    const fakeId = new mongoose.Types.ObjectId(); // creates a valid ObjectId that doesn't exist in DB

    const res = await request(app) // Send a POST request to adopt the dog
      .post(`/dogs/${fakeId}/adopt`)
      .set("Cookie", adopterCookie)
      .send();

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/Dog not found/i);
  });

  test("POST /:id/adopt should return 400 if dog already adopted", async () => {
    testDog.adoptedBy = adopterUser._id; // Manually set adoptedBy to simulate already adopted
    await testDog.save(); // Save the updated dog to the database

    const res = await request(app) // Send a POST request to adopt the dog
      .post(`/dogs/${testDog._id}/adopt`)
      .set("Cookie", adopterCookie)
      .send();

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/already been adopted/i);
  });

  test("POST /:id/adopt should return 400 if user tries to adopt their own dog", async () => {
    const res = await request(app)
      .post(`/dogs/${testDog._id}/adopt`)
      .set("Cookie", ownerCookie)
      .send();

    expect(res.status).toBe(400);
    expect(res.text).toMatch(/cannot adopt your own dog/i);
  });

  test("POST /:id/adopt should return 401 if user not authenticated", async () => {
    const res = await request(app) // Send a POST request to adopt the dog without an authentication cookie, causing requireAuth to respond with a 401 unauthorized error
      .post(`/dogs/${testDog._id}/adopt`)
      .send();

    expect(res.status).toBe(401);
  });
});



describe("Adopted dogs route", () => {
  let adopterUser, adopterCookie, dog1, dog2;

  beforeEach(async () => {
    // Create a user who will adopt dogs

    ownerUser = new User({ username: "originalOwner", password: "Password123!" });
    await ownerUser.save();

    adopterUser = new User({ username: "adopter", password: "Password123!" });
    await adopterUser.save();

    // Log in to get auth cookie
    const loginRes = await request(app)
      .post("/login")
      .send({ username: "adopter", password: "Password123!" });
    adopterCookie = loginRes.headers["set-cookie"]; // store cookie for logged in user

    // Create some dogs adopted by this user
    dog1 = await new Dog({
      name: "Charlie",
      description: "Playful pup",
      owner: ownerUser._id,
      adoptedBy: adopterUser._id,
    }).save();

    dog2 = await new Dog({
      name: "Bella",
      description: "Gentle dog",
      owner: ownerUser._id,
      adoptedBy: adopterUser._id,
    }).save();

    // Create a dog not adopted by this user
    await new Dog({
      name: "Max",
      description: "Unadopted dog",
      owner: ownerUser._id,
    }).save();
  });

  test("GET /dogsIHaveAdopted should render adopted dogs for authenticated user", async () => {
    const res = await request(app)
      .get("/dogs/dogsIHaveAdopted")
      .set("Cookie", adopterCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/originalOwner/i);
    expect(res.text).toMatch(/Charlie/i);
    expect(res.text).toMatch(/Bella/i);
    expect(res.text).not.toMatch(/Max/i); // Not adopted by user
  });

  test("GET /dogsIHaveAdopted should return 401 if user not authenticated", async () => {
    const res = await request(app).get("/dogs/dogsIHaveAdopted");

    expect(res.status).toBe(401);
  });
});


describe("All My Registered Dogs route", () => {
  let ownerUser, adopterUser, ownerCookie;
  let dogAvailable, dogAdopted, dogRemoved;

  beforeEach(async () => {
    // Create users
    ownerUser = new User({ username: "ownerUser", password: "Password123!" });
    await ownerUser.save();

    adopterUser = new User({ username: "adopterUser", password: "Password123!" });
    await adopterUser.save();

    // Log in as owner to get auth cookie
    const loginRes = await request(app)
      .post("/login")
      .send({ username: "ownerUser", password: "Password123!" });
    ownerCookie = loginRes.headers["set-cookie"];

    // Create dogs with different statuses
    dogAvailable = await new Dog({
      name: "Rex",
      description: "Available dog",
      owner: ownerUser._id,
      status: "Available",
      adoptedBy: null,
    }).save();

    dogAdopted = await new Dog({
      name: "Buddy",
      description: "Adopted dog",
      owner: ownerUser._id,
      status: "Adopted",
      adoptedBy: adopterUser._id,
    }).save();

    dogRemoved = await new Dog({
      name: "OldDog",
      description: "Removed dog",
      owner: ownerUser._id,
      status: "Removed",
      adoptedBy: null,
    }).save();
  });

  test("GET /dogs/myRegisteredDogs should return all dogs of the owner", async () => {
    const res = await request(app)
      .get("/dogs/myRegisteredDogs")
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Rex/i);
    expect(res.text).toMatch(/Buddy/i);
    expect(res.text).toMatch(/OldDog/i);
  });

  test("GET /dogs/myRegisteredDogs/adopted should return only adopted dogs", async () => {
    const res = await request(app)
      .get("/dogs/myRegisteredDogs/adopted")
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Buddy/i);
    expect(res.text).not.toMatch(/Rex/i);
    expect(res.text).not.toMatch(/OldDog/i);
  });

  test("GET /dogs/myRegisteredDogs/available should return only available dogs", async () => {
    const res = await request(app)
      .get("/dogs/myRegisteredDogs/available")
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Rex/i);
    expect(res.text).not.toMatch(/Buddy/i);
    expect(res.text).not.toMatch(/OldDog/i);
  });

  test("GET /dogs/myRegisteredDogs/removed should return only removed dogs", async () => {
    const res = await request(app)
      .get("/dogs/myRegisteredDogs/removed")
      .set("Cookie", ownerCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/OldDog/i);
    expect(res.text).not.toMatch(/Rex/i);
    expect(res.text).not.toMatch(/Buddy/i);
  });

  test("GET /dogs/myRegisteredDogs should return 401 if not authenticated", async () => {
    const res = await request(app).get("/dogs/myRegisteredDogs");
    expect(res.status).toBe(401);
  });
});



describe("Remove dog route", () => {
  let ownerUser, otherUser, ownerCookie, otherCookie, testDog;

  beforeEach(async () => {
    // Create owner and another user
    ownerUser = new User({ username: "ownerUser", password: "Password123!" });
    otherUser = new User({ username: "otherUser", password: "Password123!" });
    await ownerUser.save();
    await otherUser.save();

    // Login both users to get cookies
    const ownerRes = await request(app).post("/login").send({
      username: "ownerUser",
      password: "Password123!",
    });
    ownerCookie = ownerRes.headers["set-cookie"];

    const otherRes = await request(app).post("/login").send({
      username: "otherUser",
      password: "Password123!",
    });
    otherCookie = otherRes.headers["set-cookie"];

    // Create a dog owned by ownerUser
    testDog = await new Dog({
      name: "Max",
      description: "Loyal companion",
      owner: ownerUser._id,
      status: "Available",
    }).save();
  });

  test("POST /:id/remove should mark dog as removed for the owner", async () => {
    const res = await request(app)
      .post(`/dogs/${testDog._id}/remove`)
      .set("Cookie", ownerCookie)
      .send();

    expect(res.status).toBe(302); // Redirect status
    expect(res.headers.location).toBe("/dogs"); // Redirects to dog list

    const updatedDog = await Dog.findById(testDog._id); // Fetch the dog from the database to verify changes
    expect(updatedDog.status).toBe("Removed"); // Check status is updated to 'Removed'
  });

  test("POST /:id/remove should return 404 if user is not the owner", async () => {
    const res = await request(app)
      .post(`/dogs/${testDog._id}/remove`)
      .set("Cookie", otherCookie)
      .send();

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/Dog not found or you are not the owner/i);
  });

  test("POST /:id/remove should return 404 if dog does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/dogs/${fakeId}/remove`)
      .set("Cookie", ownerCookie)
      .send();

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/Dog not found or you are not the owner/i);
  });

  test("POST /:id/remove should return 401 if user not authenticated", async () => {
    const res = await request(app)
      .post(`/dogs/${testDog._id}/remove`)
      .send();

    expect(res.status).toBe(401);
  });
});



describe("My Dogs page route", () => {
  let authCookie;

  beforeEach(async () => {

    const res = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "Test1234!" });
    authCookie = res.headers["set-cookie"];
  });

  test("GET /mydogs should render the myDogs page for authenticated user", async () => {
    const res = await request(app)
      .get("/dogs/mydogs")
      .set("Cookie", authCookie);

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/My Dogs/i); // assuming the template contains 'myDogs' somewhere
  });

  test("GET /mydogs should return 401 if user not authenticated", async () => {
    const res = await request(app).get("/dogs/mydogs");

    expect(res.status).toBe(401);
  });
});

    
});