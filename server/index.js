require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')

const port = process.env.PORT || 9000
const app = express()
// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybs8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})
async function run() {
  try {
    const plantCollection = client.db("plantsDB").collection("plants");
    const orderCollection = client.db("plantsDB").collection("orderItems");

    // Generate jwt token
    app.post('/jwt', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
      } catch (err) {
        res.status(500).send(err)
      }
    })

    app.post("/plants", async (req, res) => {
      const plantData = req.body;
      const result = await plantCollection.insertOne(plantData);
      res.send(result);
    });

    app.patch("/quantity/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { quantityToUpdate, status } = req.body;

      let updateQuantity = {};
      if (status === 'Decrease') {
        updateQuantity = {
          $inc: { quantity: -quantityToUpdate }
        }
      }

      if (status === 'Increase') {
        updateQuantity = {
          $inc: { quantity: quantityToUpdate }
        }
      }

      const updateResult = await plantCollection.updateOne(filter, updateQuantity);
      res.send(updateResult);
    });

    app.get("/plants", async (req, res) => {
      const result = await plantCollection.find().toArray();
      res.send(result);
    });

    app.get("/plant/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const findResult = await plantCollection.findOne(query);
      res.send(findResult);
    });

    // Order Collection
    app.post("/order-items", verifyToken, async (req, res) => {
      const orderItem = req.body;
      const insertResult = await orderCollection.insertOne(orderItem);
      res.send(insertResult);
    });

    app.delete("/order-item/:id", verifyToken, async (req, res) => {
      const { status } = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const findOrder = await orderCollection.findOne(query);
      const updateStatus = {
        $set: {status: "Canceled"}
      }

      await orderCollection.updateOne(query, updateStatus);

      if (findOrder.status === "Delivered") {
        return res.status(409).send({ message: "Cannot cancel once the product is delivered" })
      }

      const deleteResult = await orderCollection.deleteOne(query);
      res.send(deleteResult);
    });

    app.get("/order-items/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.aggregate([
        {
          $match: { 'customer.email': email }
        },
        {
          $addFields: {
            plantId: { $toObjectId: '$plantId' }
          }
        },
        {
          $lookup: {
            from: 'plants',
            localField: 'plantId',
            foreignField: '_id',
            as: 'plants'
          }
        },
        { $unwind: '$plants' },
        {
          $addFields: {
            name: '$plants.name',
            image: '$plants.image',
            category: '$plants.category'
          }
        },
        {
          $project: { plants: 0 }
        }
      ]).toArray();

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from plantNet Server..')
})

app.listen(port, () => {
  console.log(`plantNet is running on port ${port}`)
})
