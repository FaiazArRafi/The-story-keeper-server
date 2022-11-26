const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();

// middleware
app.use(cors());
app.use(express.json());

const courses = require('./categories.json')



app.get('/category', (req, res) => {
    res.send(courses)
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-learning.kqxfudp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const resaleCollection = client.db('resaleBooks').collection('bookedItems');
        const usersCollection = client.db('resaleBooks').collection('users');

        app.post('/booked', async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = await resaleCollection.insertOne(booking);
            res.send(result);
        });

        app.get('/booked', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const bookings = await resaleCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.get('/users/allsellers', async (req, res) => {
            const query = { userType: 'Seller' };
            console.log(query)
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/allbuyers', async (req, res) => {
            const query = { userType: 'Buyer' };
            console.log(query)
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.delete('/users/allsellers:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/users/allbuyers:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })


    }

    finally {

    }

}
run().catch(err => console.error(err));


app.get('/category/:id', (req, res) => {
    const id = req.params.id;
    const selectedCourse = courses.find(course => course._id === id);
    res.send(selectedCourse);
})



app.get('/', (req, res) => {
    res.send('Resale Portal is running')
})


app.listen(port, () => {
    console.log('Resale Categories on port 5000', port)
})

