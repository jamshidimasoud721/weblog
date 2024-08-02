//* internal modules
const path = require('path');

//* external modules
const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const debug = require('debug')('weblog_project');
const bodyParser = require('body-parser');
const fileUpload=require('express-fileupload');

//* imports
const connectDB = require('./config/db');
const {setStatics} = require("./utils/statics");
const blogRoutes = require('./routes/blogRoutes');
const dashboardRoutes = require('./routes/dashboardRoute');
const usersRoutes = require('./routes/usersRoutes');
const winston = require('./config/winston');

const app = express();

//* load config
dotEnv.config({path: './config/config.env'});

//* database connection
connectDB();

//* passport config
require('./config/passport');

//* logging
debug('connect to database');

if (process.env.NODE_ENV === 'development') {
    debug('morgan enable');
    app.use(morgan('combined', {
        stream: winston.stream
    }));
}

//* view engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', './layouts/mainLayout');


//* body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

//* file upload
app.use(fileUpload());

//* session
app.use(session({
    secret: process.env.SESSION_SECRET,
    // cookie: {maxAge: null},
    resave: false,
    saveUninitialized: false,
    unset:'destroy',
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/weblog_db'
    })
}));

//* passport init
app.use(passport.initialize());
app.use(passport.session());

//* flash
app.use(flash());

//* statics
setStatics(app);

//* routes
app.use(blogRoutes);
app.use('/users', usersRoutes);
app.use('/dashboard', dashboardRoutes);
// app.use('/users',require('./routes/users-route'));


//* 404
app.use(require('./controllers/errorController').get404);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`server is running in ${process.env.NODE_ENV} mode and on port ${PORT}`);
});