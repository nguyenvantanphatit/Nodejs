const { MongoClient } = require("mongodb");

describe("Search Products", () => {
  let connection;
  let db;

  beforeAll(async () => {
    const uri =
      "mongodb+srv://tanphat:tanphat@cluster0.5ajy5gy.mongodb.net/?retryWrites=true&w=majority";
    connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
    });
    db = await connection.db("Sneaker");
  });

  afterAll(async () => {
    await connection.close();
  });

  test("should return products matching the search query", async () => {
    const searchQuery = "Jordan 2";
    const products = await db
      .collection("products")
      .find({ title: searchQuery })
      .toArray();

    expect(products.length).toBeGreaterThan(0);
    products.forEach((product) => {
      expect(product.title).toMatch(searchQuery);
    });
  });
});
