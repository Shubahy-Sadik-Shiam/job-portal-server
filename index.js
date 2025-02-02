const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czfhh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // jobs related apis---> 

    const jobCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationConnection = client.db("jobPortal").collection("jobApplications");

    app.get("/jobs", async(req, res)=>{
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/jobs/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

    // Job application API's---->

    app.post("/jobApplications", async(req, res)=>{
      const application = req.body;
      const result = await jobApplicationConnection.insertOne(application);
      res.send(result);
    })

    app.get("/jobApplications", async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await jobApplicationConnection.find(query).toArray();

      //  fokira way to aggregate data--->
      
      for(const application of result){
        const query1 = {_id: new ObjectId(application.jobId)}
        const job = await jobCollection.findOne(query1);
        if(job){
          application.title = job.title;
          application.company = job.company;
          application.company_logo = job.company_logo;
          application.location = job.location;
        }
      }
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Job is falling from the sky");
});

app.listen(port, () => {
  console.log(`Job is waiting at: ${port}`);
});
