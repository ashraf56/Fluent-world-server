const express = require('express')
const app = express()
const port = process.env.PORT|| 3000;
require('dotenv').config()
let cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

let jwt = require('jsonwebtoken');


app.use(cors())
app.use(express.json())

let verifyToken= (req,res,next) =>{

  let  authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SEC, (err, decoded) => 
  {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access '  })
    }
    req.decoded = decoded;
    next();
  })

}


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
    const allClassCollection = client.db("FluentWorld").collection("allclass");
    const cartClasses = client.db("FluentWorld").collection("cartclasses");

//not used 
    let verifyAdmins= async(req,res,next)=>{

      let  email= req.decoded.email;
      let query={ email: email}
      let user = await alluserCollection.findOne(query);
      if (user?.role !== 'admin'  ) {
        return res.status(403).send({error: true, message:'Forbiden'})
      }
      next();
    }
    let verifyInstructor= async(req,res,next)=>{

      let  email= req.decoded.email;
      let query={ email: email}
      let user = await alluserCollection.findOne(query);
      if (user?.role !== 'instructor') {
        return res.status(403).send({error: true, message:'Forbiden instructor'})
      }
      next();
    }


    app.post('/jwt' ,(req,res)=>{
      let body=req.body;
      let token= jwt.sign(body, process.env.ACCESS_TOKEN_SEC, { expiresIn: '1h' })
      
      res.send({ token })
      
      })

app.post('/cartClass' ,async(req,res)=>{
let carts= req.body;

// let query={ email: carts.email}
// let Existcart= await cartClasses.findOne(query);

const existingCart = await cartClasses.findOne({
  class_id: carts.class_id,
  user_id: carts.user_id,
});

if (existingCart) {
  return res.send({message:'already exist'})
}
let result= await cartClasses.insertOne(carts)
res.send(result)


})

app.get('/cartClass' , async(req,res)=>{
let email= req.query.email



let result= await cartClasses.find({email:email}).toArray()
res.send(result)


})

// app.get('/cartClass/:email' , async(req,res)=>{
//   let email=req.params.email;

// let result= await cartClasses.find({email: email}).toArray()
// res.send(result)


// })
app.delete('/cartClass/:id' ,async(req,res)=>{

  let id=req.params.id;
let query={ _id:new ObjectId(id) }
const result = await cartClasses.deleteOne(query);
res.send(result);


})



      app.post('/alluser',async(req,res)=>{
        let user=req.body;
        let query={email: user.email}
        let Existsuser= await alluserCollection.findOne(query);
        if (Existsuser) {
          return res.send({message:'already exist'})
        }
        const result = await alluserCollection.insertOne(user);
        res.send(result);
        
        })

        app.get('/alluser', async(req,res)=>{

          const result = await alluserCollection.find().toArray();
          res.send(result);

        })
        app.get('/alluser/:email', async(req,res)=>{
          let email=req.params.email;
          let query={email: email}
          const result = await alluserCollection.find(query).toArray();
          res.send(result);

        })


     

        app.delete('/alluser/:id' ,async(req,res)=>{

          let id=req.params.id;
        let query={ _id:new ObjectId(id) }
        const result = await alluserCollection.deleteOne(query);
        res.send(result);
        
        
        })     

app.get('/user/instructor', async (req,res)=>{
let result= await alluserCollection.find({role: 'instructor'}).toArray();
res.send(result)
})



app.get('/alluser/admin/:email',verifyToken, async (req,res)=>{
  let email=req.params.email;
  if (req.decoded.email !== email) {
    res.send({admin: false})
  }
  let query={email: email}
  let user= await alluserCollection.findOne(query);
  let result={admin: user?.role === 'admin'}
  res.send(result)
  })
app.get('/alluser/instructor/:email',verifyToken, async (req,res)=>{
  let email=req.params.email;
  if (req.decoded.email !== email) {
    res.send({instructor: false})
  }
  let query={email: email}
  let user= await alluserCollection.findOne(query);
  let result={instructor: user?.role === 'instructor'}
  res.send(result)
  })



app.patch('/alluser/admin/:id',async(req,res)=>{
  let id= req.params.id;
  let filter={ 
    _id: new ObjectId(id)
  }
  let updatedata={
    $set:{
      role: 'admin'
    },
  }
  let result=await alluserCollection.updateOne(filter,updatedata);
  res.send(result)
  })
app.patch('/alluser/instructor/:id',async(req,res)=>{
  let id= req.params.id;
  let filter={ 
    _id: new ObjectId(id)
  }
  let updatedata={
    $set:{
      role: 'instructor'
    },
  }
  let result=await alluserCollection.updateOne(filter,updatedata);
  res.send(result)
  })



app.get('/classes', async(req,res)=>{

  let result =await allClassCollection.find().toArray();
  res.send(result)
})
app.get('/classes/:email', async(req,res)=>{ 
let email=req.params.email
  let result =await allClassCollection.find({email:email}).toArray();
  res.send(result)
})

app.post('/classes' , async(req,res)=>{

let newclass=req.body;
let result=await allClassCollection.insertOne(newclass)
res.send(result)

})


app.patch('/classes/approve/:id',async(req,res)=>{
  let id= req.params.id;
  let filter={ 
    _id: new ObjectId(id)
  }
  let updatedata={
    $set:{
      status: 'approve'
    },
  }
  let result=await allClassCollection.updateOne(filter,updatedata);
  res.send(result)
  })

app.patch('/classes/deny/:id',async(req,res)=>{
  let id= req.params.id;
  let filter={ 
    _id: new ObjectId(id)
  }
  let updatedata={
    $set:{
      status: 'deny'
    },
  }
  let result=await allClassCollection.updateOne(filter,updatedata);
  res.send(result)
  })

  app.get('/approve', async (req,res)=>{
    let result= await allClassCollection.find({status: 'approve'}).toArray();
    res.send(result)
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