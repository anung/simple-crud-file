require('dotenv').config();

const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 3000;
const PATH_DATA = './data/users.json';


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req,res,next) => {
    return res.status(200).json({
        message: 'Hello World'
    })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//get Data user
app.get('/users',(req, res, next) => {
    const data = readFile(PATH_DATA);

    if (!data) {
        return res.status(404).json({
            message: 'No users found'
        })
    } else {
        return res.status(200).json({
            message: 'Users found',
            users: data
        })
    }
})

app.get('/users/:id',(req, res, next) => {
    const id = req.params.id;
    const data = readFile(PATH_DATA);
    const user = data.find(user => user.id == id);
    
    if (!data || user === undefined) {
        return res.status(404).json({
            message: 'No users found'
        })
    } 

    const index = data.indexOf(user);
    return res.status(200).json({
        message: 'Users found',
        users: data[index]
    })
})

//create new user
app.post('/users', (req, res, next) => {
    let data = readFile(PATH_DATA);
    if (!data)
        data = [];

    const newUser = {
        id: data.length + 1,
        full_name: req.body.full_name,
        address: req.body.address,
    }
    
    const newData = data.concat(newUser);
    fs.writeFileSync(PATH_DATA, JSON.stringify(newData));
    return res.status(201).json({
        message: 'User created',
        user: newData
    })    
});

//update existing user
app.patch('/users/:id',(req, res, next) => {
    const id = req.params.id;
    let data = readFile(PATH_DATA);
    if (!data)
        data = []

    const user = data.find(user => user.id == id);
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const index = data.indexOf(user);
    data[index].full_name = req.body.full_name;
    data[index].address = req.body.address;
    fs.writeFileSync(PATH_DATA, JSON.stringify(data));
    return res.status(200).json({
        message: 'User updated',
        user: data[index]
    })
})

//delete user
app.delete('/users/:id',(req, res, next) => {
    const id = req.params.id;
    let data = readFile(PATH_DATA);
    if (!data) 
        data = []

    const user = data.find(user => user.id == id);
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const index = data.indexOf(user);
    data.splice(index, 1);
    fs.writeFileSync(PATH_DATA, JSON.stringify(data));
    return res.status(200).json({
        message: 'User deleted',
        user: user
    })
});

function readFile(path) {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path,'[]')
        return false;
    }
    const data = fs.readFileSync(path).toString();
    const converData = JSON.parse(data);
    const checkData = converData && converData.length > 0;
    if (!checkData) {
        return false;
    }
    return converData;
}
