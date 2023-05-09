const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Coffee making server is running...')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqel2bj.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
// create database and Collection(called table in sql)
    const coffeeCollection = client.db('coffeeDB').collection('coffee')

    // data transfer to client 

    app.get('/coffee', async(req, res) => {
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/coffee/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await coffeeCollection.findOne(query);
        res.send(result)
    })

// data get from client side using post method 
    app.post('/coffee', async(req,res) => {
        const newCoffee = req.body;
        const result = await coffeeCollection.insertOne(newCoffee)
        res.send(result)
        console.log(newCoffee)
    })

    // data update 

    app.put('/coffee/:id', async(req,res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true};
        const updatedCoffee = req.body;
        const coffee = {
            $set: {
                name: updatedCoffee.name, quantity: updatedCoffee.quantity,
                supplier: updatedCoffee.supplier,
                taste: updatedCoffee.taste, details: updatedCoffee.details,
                category: updatedCoffee.category,
                photo: updatedCoffee.photo
            }
        }

        const result = await coffeeCollection.updateOne(filter, coffee, options)
        res.send(result)
    })

// data deleted 

app.delete('/coffee/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await coffeeCollection.deleteOne(query);
    res.send(result);
})

// Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Coffee server is running on port: ${port}`)
})