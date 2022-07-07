// This can be considered the integration test, while everything else is a unit test.
// This takes the API endpoints themselves, and tests general functionality as best it can.
// Really testing the type of objects are returned, and specific errors are returned.
// It will try to avoid expecting exact values, but may rely on test data.

// eslint-disable-next-line node/no-unpublished-require
const request = require("supertest");

const app = require("../main.js");

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages?q=value");
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

describe("GET /api/packages/:packageName", () => {
  test("Valid package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/what-a-package");
    expect(res.body.name).toBe("what-a-package");
  });
  test("Invalid Package, gives 'Not Found'", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res.body.message).toBe("Not Found");
  });
});

describe("DELETE /api/packages/:packageName", () => {
  test("No Auth, fails", async () => {
    const res = await request(app).delete("/api/packages/what-a-package");
    expect(res.statusCode).toBe(401); // Otherwise the no auth http status code.
  });
});
