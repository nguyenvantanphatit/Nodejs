const request = require("supertest");
const app = require("../app");
const UserTest = require("../models/user");

describe("GET /logout", () => {
  it('Chuyển hướng sang "/" nếu người dùng không được xác thực', async () => {
    const response = await request(app).get("/logout");
    expect(response.status).toBe(302);
    expect(response.header.location).toBe("/");
  });
});
