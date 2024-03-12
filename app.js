const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

server.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/uniwall');

function errorFn(err){
    console.log('Error found. Please trace!');
    console.error(err);
}

//Note: Mongoose adds an extra s at the end of the collection
//it connects to. So "post" becomes "posts"

const eventSchema = new mongoose.Schema({
  event_title: { type: String },
  event_poster: { type: String },
  event_date: { type: String },
  event_content: { type: String },
  event_id: { type: String },
  event_likes: { type: Number },
  event_dislikes: { type: Number },
  event_type: { type: String }
},{ versionKey: false });

const eventModel = mongoose.model('event', eventSchema);

server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'UniWall Home'
    });
});

server.get('/events', function(req, resp){
    const searchQuery = {};

    eventModel.find(searchQuery).lean().then(function(event_data){
        resp.render('events',{
            layout: 'index',
            title: 'UniWall Events',
            event_data: event_data
        });
    }).catch(errorFn);
});


server.get('/event/:event_id', function(req, resp) {
    const searchQuery = req.params.event_id;

    console.log('Event ID:', searchQuery);

    eventModel.findOne({ event_id: searchQuery }).lean().then(function(event) {
        console.log('Retrieved Event:', event);
        if (event) {
            resp.render('eventpage', {
                layout: 'index',
                title: 'UniWall Event Page',
                event: event
            });
        } else {
            resp.status(404).send('Event not found');
        }
    }).catch(errorFn);
});

server.get('/survey', function(req, resp){
    resp.render('survey',{
        layout: 'index',
        title: 'UniWall Survey Assistance'
    });
});

server.get('/login', function(req, resp){
    resp.render('login',{
        layout: 'index',
        title: 'UniWall Login'
    });
});

server.get('/register', function(req, resp){
    resp.render('register',{
        layout: 'index',
        title: 'UniWall Register'
    });
});

server.get('/profile', function(req, resp){
    resp.render('profile',{
        layout: 'index',
        title: 'UniWall Profile'
    });
});

const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
