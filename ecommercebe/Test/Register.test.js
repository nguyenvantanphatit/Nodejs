const request = require("supertest");
const app = require("../app");
const UserTest = require("../models/user");
const { MongoClient } = require("mongodb");

describe("Registration", () => {
  let connection;
  let db;

  beforeAll(async () => {
    const uri =
      "mongodb+srv://tanphat:tanphat@cluster0.5ajy5gy.mongodb.net/Sneaker?retryWrites=true&w=majority";
    connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
    });
    db = await connection.db("DK");
  }, 51000);

  afterAll(async () => {
    await connection.close();
  }, 51000);

  it("Hiển thị trang đăng ký", async () => {
    const res = await request(app).get("/register");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("register");
  }, 51000);

  it("Đăng ký thành công", async () => {
    const response = await request(app).post("/register").send({
      username: "thanh123@gmail.com",
      name: "Thanh Pham",
      password: "123",
    });
    expect(response.status).toBe(302);
    expect(response.header.location).toBe("/");
    const user = await UserTest.findOne({ username: "thanh123@gmail.com" });
    expect(user).toBeDefined();
  });
});
