const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectID = require('mongodb').ObjectId
//middleware
app.use(cors());
app.use(express.json());

// mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.js8fvq9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

console.log(uri);

async function run() {
    try {
        await client.connect()
        console.log('database connected')
        const database = client.db("Volunteer-Network-Main");
        const addEventCollection = database.collection("Volunteer-Network-Add-Event");
        const serviceCollection = database.collection("Volunteer-Network-Service");
        const registerUsersCollection = database.collection("Volunteer-Network-User-Register");

        // get service api 
        app.get('/home', async (req, res) => {
            const cursor = serviceCollection.find({})
            const volunteerService = await cursor.toArray();
            res.send(volunteerService)
        })
        //get volunteer user api
        app.get('/register', async (req, res) => {
            const cursor = registerUsersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })
        // app.get
        app.get('/register/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectID(id) };
            const result = await registerUsersCollection.findOne(query);

            console.log('load user id:', id);
            res.send(result)
        })

        // post new event api 
        app.post('/addEvent', async (req, res) => {
            const newEvent = req.body;
            const result = await addEventCollection.insertOne(newEvent)
            console.log('added new event successfully', req.body);
            console.log('added event', result)
            res.json(result);
        })
        // post api
        app.post('/register', async (req, res) => {
            const newUser = req.body;

            const result = await registerUsersCollection.insertOne(newUser)
            console.log('added new user successfully', req.body);
            console.log('added user', result)
            res.json(result);
        })

        //update volunter user api
        app.put('/register/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectID(id) };
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email
                },
            }
            const result = await registerUsersCollection.updateOne(filter, updateDoc, option)
            console.log('uapdate user')
            res.json(result)
        })

        // delete api
        app.delete('/register/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectID(id) };
            const result = await registerUsersCollection.deleteOne(query);

            console.log("goinig to delete", result)
            res.json(result)
        })




    }
    finally {
        await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("server running")
})

app.listen(port, () => {
    console.log("lisining to port", port)
})