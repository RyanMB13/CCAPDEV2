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

server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index',
        title: 'UniWall Home'
    });
});

server.get('/events', function(req, resp){
    resp.render('events',{
        layout: 'index',
        title: 'UniWall Events'
    });
});

server.get('/eventpage', function(req, resp){
    resp.render('eventpage',{
        layout: 'index',
        title: 'UniWall Event Page'
    });
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
