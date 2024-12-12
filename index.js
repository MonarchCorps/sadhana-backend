require('dotenv').config();
const express = require('express')
const { default: mongoose } = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/dbConnection')
const credentials = require('./middleWare/credentials')
const corsOptions = require('./config/corsOptions')
const verifyJWT = require('./middleWare/verifyJWT')

const { app, server } = require('./config/socket')
const PORT = process.env.PORT || 3500

connectDB();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use('/', require('./routes/root'));
app.use('/home', (req, res) => res.send('Hello'))

app.use(express.json());

// auth routes
app.use('/auth', require('./routes/auth'));
app.use('/register', require('./routes/register'));

// public end point routes
app.use('/public', require('./routes/api/publicEndPoint'));

//last active route
app.use('/last-active', require('./routes/lastActive'));

app.use('/upload', require('./routes/upload'))

/****** I put the webhook here cos, the verifyJwt is interfering with it *******/
app.use('/webhook', require('./routes/webhook'))
/**********************************************************/

// jwt's middleware
app.use(verifyJWT);

// admin routes
app.use('/admin-cp', require('./routes/api/admin'));

// instructor route
app.use('/instructor-cp/edit-instructor-profile', require('./routes/api/instructor'))

// students route
app.use('/student-cp', require('./routes/api/user'));

// class route
app.use('/class', require('./routes/api/protectedCourses'));

//similar routes
app.use('/edit-profile', require('./routes/api/editProfile'))

app.use('/bot/chat', require('./routes/botChat'))

app.use('/custom-photo', require('./routes/customPhoto'))

app.use('/enrolled', require('./routes/enrolled'))

app.use('/earning', require('./routes/earning'))
app.use('/payment', require('./routes/payment'))
app.use('/payout', require('./routes/payout'))

app.use('/conversation', require('./routes/chat/conversation'))
app.use('/message', require('./routes/chat/message'))

app.use('/chat/all-users', require('./routes/allUsers'))
app.use('/chat/token', require('./routes/getToken'))

mongoose.connection.once('open', () => {
    console.log('Connected to Database successfully');
    server.listen(PORT, () => {
        console.log(`Server running on PORT: ${PORT}`);
    })
});

mongoose.connection.on('error', err => {
    console.error(err)
})