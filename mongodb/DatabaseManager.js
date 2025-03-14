import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";
const uri = `mongodb+srv://eclecticappdevelopment:${process.env.MONGO_BOTCBot_PASS}@botc-bot.rstguck.mongodb.net/?retryWrites=true&w=majority&appName=BOTC-Bot`;
console.log(uri);
export class DatabaseManager {
  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }

  async init(db, collection) {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect();
      // Send a ping to confirm a successful connection
      const collection = await this.client.db(db).collection(collection);
      return collection;
    } catch (err) {
      console.log("Error initalizing", err);
    }
  }

  async run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect();
      // Send a ping to confirm a successful connection
      await this.client.db("admin").command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  async insert(db, collection, data) {
    try {
      await this.client.connect();
      const col = await this.client.db(db).collection(collection);
      if (typeof data == "array") {
        await col.insertMany(data, false);
      } else {
        await col.insertOne(data);
      }
    } finally {
      await this.client.close();
    }
  }

  //Store - either insert or update
  async store(db, collection, data) {
    try {
      //INIT COLLECTION WITH HELPER FUNCTION
      const col = this.init(db, collection);
      //First check for data
      const result = await this.retrieve(col, data);
      //check result
      if (result.length > 0) {
        console.log("Updating", data.name);
        //UPDATE THIS RESULT
        await col.updateOne({ name: data.name }, { $set: data });
      } else {
        console.log("Inserting", data.name);
        //INSERT THIS RESULT
        await col.insertOne(data);
      }
    } finally {
      await this.client.close();
    }
  }

  async retrieve(col, data) {
    try {
      //First check for data
      const result = await col.findOne({ name: data.name }).catch((err) => {
        console.log("Error finding:", err);
        return [];
      });
      return result;
    } catch (err) {
      console.log("Error retrieving", err);
    }
  }

  async close() {
    await this.client.close();
  }
}
