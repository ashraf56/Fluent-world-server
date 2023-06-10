const express = require('express')
const app = express()
const port = process.env.PORT|| 3000;
let cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
let jwt = require('jsonwebtoken');


app.use(cors())
app.use(express.json())

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

    const alluserCollection = client.db("FluentWorld").collection("alluser");


    app.post('/jwt' ,(req,res)=>{
      let body=req.body;
      let token= jwt.sign(body, process.env.ACCESS_TOKEN_SEC, { expiresIn: '1h' })
      
      res.send({ token })
      
      })

      app.post('/alluser',async(req,res)=>{
        let user=req.body;
        // let query={email: user.email}
        // let existcoll= await alluserCollection.findOne(query);
        // if (existcoll) {
        //   return res.send({message:'already exist'})
        // }
        const result = await alluserCollection.insertOne(user);
        res.send(result);
        
        })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Summer school !')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})