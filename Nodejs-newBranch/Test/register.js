const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://thanh123:123@cluster0.dobo1ia.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

async function registerUser(username, password) {
  try {
    await client.connect();
    const database = client.db("DK");
    const collection = database.collection("users");
    const result = await collection.insertOne({ username: username, password: password });
    return result.insertedId;
  } catch(err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

module.exports = registerUser;