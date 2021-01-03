const express =  require('express')
const app = new express()
const pool = require('./db')
let {createParty} = require('./QueryConstants')
app.listen(3000)

app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded())

app.get('/register',(req,res)=>{
    console.log(req.statusCode,res.statusCode)
    let message = 'default'
    if(res.statusCode==301){
        message="Passwords don't match";
    }
    res.render('register',{title:'Register',message})
});


app.post('/register',async(req,res)=>{
    try{
        console.log("Inside the post callback Method....")
        const name = req.body['Name']
        const address = req.body['Address']
        const gender = req.body['Gender']
        const age = req.body['Age']
        const mail = req.body['Email']
        const phone = req.body['Phone']
        const password = req.body['Password']
        const confirmPassword = req.body['confirmPassword']

        if(password!=confirmPassword)
            {
                res.redirect('register',301)
            }

        insertQuery = createParty.concat(`VALUES('${name}','${address}','${gender}',${age},'${mail}',${phone})`)
        console.log(insertQuery)
        const queryResult =await pool.query(insertQuery);
        // res.send(queryResult)
        res.end()
    }
    catch(err){
        throw err;
    }    

})

// Route handlers
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',)

