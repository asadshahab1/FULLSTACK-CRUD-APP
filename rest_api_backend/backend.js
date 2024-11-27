const express = require('express');
const cors = require('cors');

app = express()
app.use(cors());
const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
const PORT = 5000;

var tasks = [{id:1,name:'EAT'},{id:2,name:'SLEEP'},{id:3, name:'LEARN'},{id:4, name:'REPEAT'}];
app.use(express.json());

app.get('/tasks', async (req,res)=>{
    return res.json({tasks});
});

app.post('/task',async (req,res)=>{
    const body = req.body
    tasks.push(body);
    console.log(tasks);
    return res.status(201).json({"message":"Task added successfully"});
})

app.delete('/tasks/:id', async (req,res)=>{

  tasks = tasks.filter(task => task.id != req.params.id);
  console.log(tasks);
  return res.status(201).json({"message":"Deleted"});
  
  });

app.patch('/tasks/:id',async (req,res)=>{
  if (req.body.id){
    tasks = tasks.map(task=>task.id == req.params.id ? {...task, id: req.body.id}: task);
  }
  if (req.body.name){
    tasks = tasks.map(task => task.id == req.params.id ? {...task, name: req.body.name} : task);
  }
  return res.status(201).json({"message":"Updated"});
});

app.put('/tasks/:id', async (req,res)=>{
  const index = tasks.findIndex(task => task.id == req.params.id);
  if (index != -1){
    tasks[index] = req.body;
  }
  console.log(tasks);
  return res.status(201).json({"message":"Updated entire resource"});
})
app.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`);

})