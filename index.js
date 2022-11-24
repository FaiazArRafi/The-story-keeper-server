const express = require('express')
const app = express();
var cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors())

const courses = require('./categories.json')


app.get('/', (req, res) => {
    res.send('Resale Portal')
})

app.get('/category', (req, res) => {
    res.send(courses)
})

app.get('/category/:id', (req, res) => {
    const id = req.params.id;
    const selectedCourse = courses.find(course => course._id === id);
    res.send(selectedCourse);
})


app.listen(port, () => {
    console.log('Resale Categories on port 5000', port)
})

