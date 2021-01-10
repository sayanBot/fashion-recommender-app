const express =  require('express')
const app = new express()
const pool = require('./db')
const crytpo = require('crypto')
const util = require('util')
let {createParty} = require('./QueryConstants')
let {searchPartyByEmail} = require('./QueryConstants')
const { get } = require('http')
const scrypt = util.promisify(crytpo.scrypt)
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session);
const dotenv = require('dotenv').config()

let PORT  = process.env.PORT || 3000
app.listen(PORT,()=>console.log(`Listening to localhost at port ${PORT}`))

app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded())

app.use(express.static('public'))

// Declaring the session object attributes
app.use(session({
    name:'userSession',
    store: new pgSession({
        pool: pool,
        tableName: 'session'   
    }),
    cookie:{maxAge:1*24*60*60*1000 ,httpOnly:false}, //in millisecs..1 day
    secret:process.env.COOKIE_SECRET,
    resave:false,
    saveUninitialized:false
}));


app.get('/register',(req,res)=>{
    res.render('register',{title:'Register',req:req})
});

app.get('/',(req,res)=>{
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
    if(req.session.loggedIn){
        console.log(req.session)
        res.redirect('addItem')
    }
    else
        res.render('login',{title:'login',req:req})
})
app.post('/login',async (req,res)=>{
    
    const  email = req.body['Email'];
    const  typed_password  = req.body['Password'];
    
    // Call the authentication function
    let check =  await authenticaion(res,email,typed_password)
    if(check)
        {
            req.session.email = email
            req.session.loggedIn = true
            console.log(req.session.id) 
            res.redirect('/addItem')
        }
    else{
           //Checking for password
           res.redirect('/login?error='+ encodeURIComponent('Incorrect Password!!'));
        }
})

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
                res.redirect('/register?error='+encodeURIComponent('Incorrect password'));
                return;
            }
        // ....hashing the password
        // random data to be added to the password
        const salt = crytpo.randomBytes(8).toString('hex')
        const hashedPassword = await scrypt(password,salt,10)   
        const storedPassword = hashedPassword.toString('hex')     
 
        // Insert Query
        insertQuery = createParty.concat(`VALUES('${name}','${address}','${gender}',${age},'${mail}',${phone},'${storedPassword}','${salt}')`)
        console.log(insertQuery)
        const queryResult =await pool.query(insertQuery);
        // res.send(queryResult)
        // If successful redirect to login page

        res.redirect('/login')
        res.end()
    }
    catch(err){
        throw err;
    }    

})

// Route handlers
app.get('/addItem',(req,res)=>{
    if(!req.session.loggedIn)
        res.redirect('/login')
    res.render('index',{title:'Shop',req:req})
})

app.get('/logout',(req,res)=>{
    let user = req.session.email 
    req.session.destroy((err)=>{
        if(err)
            throw new Error(err)
        else{
            console.log(`User-${user}-Logged out`)
            res.redirect('/login')
        }
    })
})

const authenticaion = async (res,email,typed_password)=>{
    try{
        let searchQuery = searchPartyByEmail+`'${email}'`
        const searchResult = await pool.query(searchQuery);
        //Return error if no email is fetched as it means there is no user with that mail
        if(searchResult.rowCount==0){
            res.redirect('/login?error='+ encodeURIComponent('Incorrect Email!!'));
        }
        const password_salt = searchResult.rows[0]['password_salt']
        const party_password = searchResult.rows[0]['party_password']

        const hashed_password = (await scrypt(typed_password,password_salt,10)).toString('hex')
        
        if(hashed_password===party_password)
            return true;
        else
            return false;

    }
    catch(e){
        throw Error(e)
    }

}

