const express = require('express')
const app = express()

const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')
const URI = process.env.MONGO_URL

const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoutes = require('../routes/user.routes')
const adminRoutes = require('../routes/admin.routes')


const cors = require('cors')
app.use(cors({
        origin: "https://level3-project-event-nex.vercel.app",
        methods: "GET, POST, PUT, DELETE, PATCH",
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use("/user", userRoutes)
app.use("/admin", adminRoutes)


mongoose.connect(URI)
        .then(() => {
                console.log('connected to mongodb')
        }).catch((err) => {
                console.log('connection error', err)
        })


// app.listen(port, () => {
//         console.log(`app is running on port ${port}`)
// })

module.exports = app
