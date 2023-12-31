const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.btjmiui.mongodb.net/?retryWrites=true&w=majority`;

// Middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH']
}
app.use(cors(corsConfig))
app.use(express.json());

console.log(process.env.DB_PASS);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const usersCollection = client.db('PolyLingualDB').collection('users');
    const instructorsCollection = client.db('PolyLingualDB').collection('InstructorsCollections');
    const cartCollection = client.db('PolyLingualDB').collection('cartCollections');

    app.get('/instructors', async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    })



    //users collection api

    app.get('/users',async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })


    app.post('/users',async(req,res)=>{
      const user = req.body;
      console.log(user);
      const query = {email: user.email};
      console.log(email);
      const existingUser = await usersCollection.findOne(query);
      console.log("Old user",existingUser)
      if(existingUser){
        return res.send({message:"User already exist"});
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role:'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // app.get('/users/admin/:email',async(req,res)=>{
    //   const email = req.params.email;
    //   const query = {email:email};
    //   const user = awa
    // })




    //cart collection apis

    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = {email:email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })


    app.delete('/carts/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })


  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {

  }
}

run().catch(console.dir);

// Root endpoint
app.get('/', (req, res) => {
  res.send("Server is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

