const express = require("express");
const server = express();
const cookieparser = require('cookie-parser')
const mongoose = require('mongoose');
const { name } = require("ejs");
const jwt = require('jsonwebtoken')
server.use(express.urlencoded({ extended: true }))
server.use(cookieparser())

server.set('view engine', 'ejs')

mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: 'forms'
}).then(() => {
    console.log('data is connected')
}).catch((e) => {
    console.log(e)
})

const userSchema = new mongoose.Schema({
    name: String, email: String ,password:String
})

const msg = mongoose.model('informations', userSchema)

const isAuthenticated = async (req, res, next) => {

    const token = req.cookies.token;

    if (token) {
        const decode = jwt.verify(token, 'IM your key')
        console.log(decode)
        req.messages = await msg.findById(decode._id)
        next()
    }
    else {
        res.redirect('/login')
    }
}

// making protected route agr user login hh/cookie me data hh tou ye page render krdo 

server.get('/', isAuthenticated, (req, res) => {
    
    res.render('logout',{name:req.messages.name})
})

server.get('/register',  (req, res) => {
    
    res.render('register')
})

server.get('/login',  (req, res) => {
    
    res.render('login')
})


server.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const reg = await msg.findOne({ email });
    
    if (!reg) {
        return res.redirect('/register');
    }

    const ismatch = reg.password === password;

    if (!ismatch) {
        return res.render('login', { show: 'incorrect password' });
    }
    const token = jwt.sign({ _id: reg._id }, 'IM your key')
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect('/')
    

    // Rest of your code for successful login
});
server.post('/register', async (req, res) => {

    const { name, email ,password} = req.body

    const register=await msg.findOne({email})
    if(register){
        return res.redirect('/login')     
    }
    const messages = await msg.create({
        name, email,password
    })

    const token = jwt.sign({ _id: messages._id }, 'IM your key')
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect('/')
})

server.get('/logout', (req, res) => {
    res.cookie("token", null, {
        httpOnly: true, expires: new Date(Date.now())
    })
    res.redirect('/')
})


server.listen(2020, (req, res) => {
    console.log('server has been started')
})