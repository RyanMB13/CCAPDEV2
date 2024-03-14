const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const handlebars = require('handlebars');

handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

const expressHandlebars = require('express-handlebars');
const hbs = expressHandlebars.create({
    extname: 'hbs',
    helpers: {
    }
});

server.set('view engine', 'hbs');
server.engine('hbs', hbs.engine);

server.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/uniwall');

function errorFn(err) {
    console.log('Error found. Please trace!');
    console.error(err);
}

// Note: Mongoose adds an extra s at the end of the collection
// it connects to. So "post" becomes "posts"

const userSchema = new mongoose.Schema({
    user_name: { type: String },
    user_password: { type: String },
    user_id: { type: String }
}, { versionKey: false });

const userModel = mongoose.model('user', userSchema);

const eventSchema = new mongoose.Schema({
    event_title: { type: String },
    event_poster: { type: String },
    event_date: { type: String },
    event_content: { type: String },
    event_id: { type: String },
    event_likes: { type: Number },
    event_dislikes: { type: Number },
    event_type: { type: String }
}, { versionKey: false });

const eventModel = mongoose.model('event', eventSchema);

const commentSchema = new mongoose.Schema({
    event_id: { type: String },
    comment_poster: { type: String },
    comment_date: { type: String },
    comment_content: { type: String },
}, { versionKey: false });

const commentModel = mongoose.model('comment', commentSchema);

const postSchema = new mongoose.Schema({
    post_title: {type: String},
    post_author: {type: String},
    post_date: {type: String},
    post_content: {type: String},
    post_id: {type: String}
}, {versionKey:false});

const postModel = mongoose.model('post', postSchema);

const feedbackSchema = new mongoose.Schema({
    post_id: { type: String },
    comment_author: { type: String },
    comment_date: { type: String },
    comment_content: { type: String },
}, { versionKey: false });

const feedbackModel = mongoose.model('feedback', feedbackSchema);

const surveySchema = new mongoose.Schema({
    survey_id: { type: String },
    survey_author: { type: String },
    survey_date: { type: String },
    survey_content: { type: String },
    survey_status: { type: String },

}, { versionKey: false });

const surveyModel = mongoose.model('survey', surveySchema);

server.get('/', function (req, resp) {
    const searchQuery = {};

    postModel.find(searchQuery).lean().then(function (post_data) {
        resp.render('main', {
            layout      : 'index',
            title       : 'UniWall Posts',
            post_data   : post_data
        });
    }).catch(errorFn);
});

server.get('/post/:post_id', function (req, resp) {
    const searchQuery = req.params.post_id;

    console.log('Post ID:', searchQuery);

    postModel.findOne({ post_id: searchQuery }).lean().then(function (post) {
        feedbackModel.find({post_id: searchQuery}).lean().then(function (feedback) {
            console.log('post Data Before Rendering:', post);
            console.log('Comment Data Before Rendering:', feedback);
            if (post) {
                resp.render('maincomments', {
                    layout           : 'index',
                    title            : 'UniWall Event Page',
                    post             :  post,
                    feedback         :  feedback
                });
            } else {
                resp.status(404).send('Post not found');
            }
        }).catch(errorFn);
    }).catch(errorFn);        
});


server.get('/events', function (req, resp) {
    const searchQuery = {};

    eventModel.find(searchQuery).lean().then(function (event_data) {
        resp.render('events', {
            layout      : 'index',
            title       : 'UniWall Events',
            event_data  : event_data
        });
    }).catch(errorFn);
});


server.get('/event/:event_id', function (req, resp) {
    const searchQuery = req.params.event_id;

    console.log('Event ID:', searchQuery);

    eventModel.findOne({ event_id: searchQuery }).lean().then(function (event) {
        commentModel.find({event_id: searchQuery}).lean().then(function (comment) {
            console.log('Event Data Before Rendering:', event);
            console.log('Comment Data Before Rendering:', comment);
            if (event) {
                resp.render('eventpage', {
                    layout      : 'index',
                    title       : 'UniWall Event Page',
                    event       : event,
                    comment     : comment
                });
            } else {
                resp.status(404).send('Event not found');
            }
        }).catch(errorFn);
    }).catch(errorFn);        
});

server.post('/login', function (req, resp) {
    const username = req.body.user;
    const password = req.body.pass;

    console.log('Received username:', username);

    userModel.findOne({ user_name: username }).lean().then(function (user) {
        console.log('Database query result:', user);

        if (!user) {
            console.log('Username not found');
            resp.status(404).json({ error: 'Username not found' });
        } else if (user.user_password !== password) {
            console.log('Incorrect password');
            resp.status(401).json({ error: 'Incorrect password' });
        } else {
            console.log('Login successful for user:', username);
            resp.status(200).json({ message: 'Login successful' });
        }
    }).catch(function (err) {
        console.error('Error occurred during login:', err);
        resp.status(500).json({ error: 'Internal server error' });
    });
});

server.get('/survey', function (req, resp) {
    const searchQuery = {};
    surveyModel.find(searchQuery).lean().then(function (survey_data) {
        resp.render('survey', {
            layout      : 'index',
            title       : 'UniWall Posts',
            survey_data   : survey_data
        });
    }).catch(errorFn);
});

server.get('/login', function (req, resp) {
    resp.render('login', {
        layout: 'index',
        title: 'UniWall Login'
    });
});

server.get('/register', function (req, resp) {
    resp.render('register', {
        layout: 'index',
        title: 'UniWall Register'
    });
});

server.get('/profile', function (req, resp) {
    resp.render('profile', {
        layout: 'index',
        title: 'UniWall Profile'
    });
});

const port = process.env.PORT || 9090;
server.listen(port, function () {
    console.log('Listening at port ' + port);
});
