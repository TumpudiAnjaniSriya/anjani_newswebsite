const express = require('express');
const ej = require('ejs');
const bp = require('body-parser');
const ph = require('password-hash')
const axios = require('axios');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter} = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
const s = db.collection("signup1")
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.get("/signup" , function(req,res){
    res.sendFile(__dirname+'/index.html')
})

app.post("/signupsubmit",function(req,res){
  db.collection("signup1").where(Filter.or(
    Filter.where("username","==",req.body.username),
    Filter.where("password","==",req.body.pwsd)
    )).get().then((docs)=>{
        if(docs.size>0)
        res.send("username already exixts or use strong password")
        else
        db.collection("signup1").add({
            username : req.body.username,
            password : ph.generate(req.body.pwsd),
            Firstname: req.body.fname,
            Lastname : req.body.lname
  })
  .then(()=>{
      res.sendFile(__dirname+"/log.html")
  })
})
})
app.get("/login",function(req,res){
  res.sendFile(__dirname+"/log.html")
})
app.post("/loginsubmit",function(req,res){
  db.collection("signup1").where('username','==',req.body.Email ).get()
  .then((docs)=>{
    let verified = false;
    docs.forEach((doc)=>{
     verified =  ph.verify(req.body.pswd, doc.data().password);
    })
    if(verified)
    res.render("news.ejs")
    else
    res.send("fails")
  })
})
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/lander.html');
})

app.get('/about',(req,res)=>{
  res.render("index.ejs",{titles:''})
})
app.post('/about',(req,res)=>{
  async function request(){
    const con = req.body.country;
    const titles = [];
    const options = {
  method: 'POST',
  url: 'https://newsnow.p.rapidapi.com/',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': '67aef8ebc7mshb36ed64f9a8867dp1b65abjsnba361f5a4a8f',
    'X-RapidAPI-Host': 'newsnow.p.rapidapi.com'
  },
  data: {
    text: con,
    region: 'wt-wt'
  }
};
const response = await axios.request(options);
for(let i = 0 ;i<response.data.news.length;i++){
  const tit = response.data.news[i];
  titles.push(tit)
}
  console.log(titles)
  res.render('index.ejs',{titles:titles})
} ;
request();
});

app.get('/about1',(req,res)=>{
  res.render("index1.ejs",{articles:''})
})
let a = []
app.post('/about1',(req,res)=>{
  const articles = [];
  const c = req.body.cat;
   axios.get('https://newsapi.org/v2/top-headlines?country=in&category='+c+'&apiKey=c2cf95260352471fba752bdecfd276eb').then(response => {
  for(let i=0;i<response.data.articles.length;i++){
    const art = response.data.articles[i];
    articles.push(art)
    a.push(art)
  }
  res.render("index1.ejs",{articles:articles});
 })
.catch(err => console.log(err))  
})


app.listen(3000,()=>{
  console.log("server started")
})
