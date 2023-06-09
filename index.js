const express = require('express')
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion } = require('mongodb');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5nj1o0g.mongodb.net/?retryWrites=true&w=majority`; 

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})