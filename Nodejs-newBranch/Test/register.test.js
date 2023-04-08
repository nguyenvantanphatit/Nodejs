const registerUser = require('./register');

describe('registerUser', () => {
  let userId;
  
  beforeAll(async () => {
    // Kết nối đến cơ sở dữ liệu
    await registerUser('testuser', 'testpassword');
  },50000);

  afterAll(async () => {
    // Xóa người dùng được thêm vào cơ sở dữ liệu
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://thanh123:123@cluster0.dobo1ia.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const database = client.db("DK");
    const collection = database.collection("users");
    await collection.deleteOne({ _id: userId });
    await client.close();
  },50000);

  it('should register a new user', async () => {
    // Kiểm tra xem người dùng đã được thêm vào cơ sở dữ liệu hay chưa
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://thanh123:123@cluster0.dobo1ia.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    const database = client.db("DK");
    const collection = database.collection("users");
    const result = await collection.findOne({ username: 'testuser' });
    userId = result._id;
    expect(result).toBeDefined();
    expect(result.username).toBe('testuser');
    expect(result.password).toBe('testpassword');
    await client.close();
  },50000);
});