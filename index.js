const express = require('express')
const app = express();
const Ajv = require('ajv');
const ajv = new Ajv();
const port = 3000
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');

let userDb = [];

passport.use(new BasicStrategy(
    (username, password, done) => {
        console.log('Basic strategy params. username: ' + username + " , password: " + password);
        
        
        const searchResult = userDb.find(user => {
            if(user.username === username){
                if(bcrypt.compareSync(password, user.password)) {
                    return true;
                }
            }
            return false;
        })
        if(searchResult != undefined){
            done(null, searchResult);
        } else {
            done(null, false);
        }
    
    }
));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const postsSchema = require('./schemas/posts.schema.json');
const postsValidator = ajv.compile(postsSchema);

const postsValidateMw = function(req, res, next) {
    const validationResult = postsValidator(req.body, res, next);
    if(validationResult == true) {
        next();
    } else {
        res.sendStatus(400);
    }
}

const userSchema = require('./schemas/user.schema.json');
const userValidator = ajv.compile(userSchema);

const userValidateMw = function(req, res, next) {
    const validationResult = userValidator(req.body, res, next);
    if(validationResult == true) {
        next();
    } else {
        res.sendStatus(400);
    }
}

const posts = [
 {
    "title": "Auto",
    "description": "peuskunnossa",
    "category": "Cars",
    "location": "Oulu",
    "images": 
    {
    "image1": "https://cdn.pixabay.com/photo/2015/12/08/00/28/car-1081742_960_720.jpg",
    "image2": "",
    "image3": "",
    "image4": ""
    },
    "price": 1000,
    "dateOfPosting": "2019-08-24",
    "deliveryType": "Shipping",
    "seller": {
    "name": "Bob",
    "email": "bob.fellow@gmail.com"
    } 
 }
];


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
    
  res.send("Logged in!");

})

app.get('/posts/category/:category', (req, res) => {
    const post = posts.find(d => d.category === req.params.category);
    if(post === undefined) {
        res.sendStatus(404);
    } else {
        res.json(post);
    }
})

app.get('/posts/location/:location', (req, res) => {
    const post = posts.find(d => d.location === req.params.location);
    if(post === undefined) {
        res.sendStatus(404);
    } else {
        res.json(post);
    }
})

app.get('/posts/dateOfPosting/:dateOfPosting', (req, res) => {
    const post = posts.find(d => d.dateOfPosting === req.params.dateOfPosting);
    if(post === undefined) {
        res.sendStatus(404);
    } else {
        res.json(post);
    }
})

app.delete('/posts', (req, res) => {
   res.send("Post Deleted");
})

app.put('/posts', (req, res) => {

})

app.post('/posts', postsValidateMw, (req, res) => {

    posts.push({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        images:{
            image1: req.body.image1,
            image2: req.body.image2,
            image3: req.body.image3,
            image4: req.body.image4
        },
        price: req.body.price,
        dateOfPosting: req.body.dateOfPosting,
        deliveryType: req.body.deliveryType,
        seller:{
            name: req.body.name,
            email: req.body.email
        }
    });
    res.sendStatus(201);
})

app.post('/signup', (req, res) => {
 
    console.log('original password' + req.body.password);
    const salt = bcrypt.genSaltSync(6);
    console.log('salt' + salt);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log('hashed password' + hashedPassword);

    const newUser =
    {
     id: req.body.id,
     firstName: req.body.firstName,
     lastName: req.body.lastName,
     email: req.body.email,
     password: hashedPassword,
     username: req.body.username,
    }

    userDb.push(newUser);
    res.sendStatus(201);
 })




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})