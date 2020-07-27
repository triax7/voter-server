const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoute = require('./routes/auth')
const pollRoute = require('./routes/poll')
const userRoute = require('./routes/user')
const cookieParser = require('cookie-parser')

dotenv.config()

mongoose.connect(process.env.MONGODB_URI || process.env.DB_CONNECT_LOCAL, () => {
    console.log('Connected to db')
})

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('/api/poll', pollRoute)
app.use('/api/user', userRoute)

app.listen(process.env.PORT || 3001, () => console.log('Server running'))
