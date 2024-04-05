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
const ObjectId = mongoose.Types.ObjectId;
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
    _id: mongoose.Schema.Types.ObjectId,
    event_title: { type: String },
    event_poster: { type: String },
    event_date: { type: String },
    event_content: { type: String },
    event_id: { type: String },
    event_likes: { type: Number },
    event_dislikes: { type: Number },
    event_type: { type: String },
    visible: { type: Boolean }
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

const profileSchema = new mongoose.Schema({
    profile_name: { type: String },
    profile_course: { type: String },
    profile_picture: { type: String }
}, { versionKey: false });

const profileModel = mongoose.model('profile', profileSchema);

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

// Define a schema for the counter collection
const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 1 }
});

// Create a model for the counter collection
const counterModel = mongoose.model('counter', counterSchema);

// Function to get the next value of the counter and increment it
async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await counterModel.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.value;
}

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

// Route to handle displaying the edit form for a specific post
server.get('/editPost/:postId', function (req, res) {
    const postId = req.params.postId;

    // Retrieve the post data from the database
    postModel.findOne({ post_id: postId })
        .then(post => {
            if (!post) {
                res.status(404).send('Post not found');
            } else {
                // Render the edit form with the existing data pre-filled
                res.render('editPost', { post: post });
            }
        })
        .catch(error => {
            console.error('Error finding post:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Route to handle editing a post
server.post('/editPost/:postId', function (req, res) {
    const postId = req.params.postId;
    const { postTitle, postContent } = req.body;

    // Update the post data in the database
    postModel.findOneAndUpdate({ post_id: postId }, { post_title: postTitle, post_content: postContent })
        .then(updatedPost => {
            if (!updatedPost) {
                res.status(404).send('Post not found');
            } else {
                res.redirect('/'); // Redirect to main page after successful edit
            }
        })
        .catch(error => {
            console.error('Error updating post:', error);
            res.status(500).send('Internal Server Error');
        });
});



// Route handler for handling form submission
server.post('/submitPost', async function (req, res) {
    try {
        // Extract data from form submission
        const { postTitle, postAuthor, postContent, postDate } = req.body;

        // Get the last post from the database
        const lastPost = await postModel.findOne().sort({ post_id: -1 });

        let nextPostId = 1; // Default value if no posts are in the database

        if (lastPost) {
            nextPostId = parseInt(lastPost.post_id) + 1;
        }
        // Create new post document
        const newPost = new postModel({
            post_id: nextPostId, // Assign the next available ID to the post
            post_title: postTitle,
            post_author: postAuthor,
            post_date: postDate,
            post_content: postContent
        });

        // Save the new post to the database
        const savedPost = await newPost.save();
        console.log('New post saved:', savedPost);
        res.redirect('/'); // Redirect to main page after successful submission
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).send('Error saving post');
    }
});

// Route to handle deleting a post
server.post('/deletePost', function(req, res) {
    const postId = req.body.postId;

    // Delete the post from the database
    postModel.findOneAndDelete({ post_id: postId })
        .then(deletedPost => {
            if (!deletedPost) {
                res.status(404).send('Post not found');
            } else {
                res.status(200).send('Post deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            res.status(500).send('Internal Server Error');
        });
});


// Add a route to handle comment submission
server.post('/submitComment', function(req, res) {
    const postId = req.body.postId;
    const commentText = req.body.commentText;

    // Create a new comment document
    const newComment = new feedbackModel({
        post_id: postId,
        comment_author: "User", // You can modify this to get the actual user who is logged in
        comment_date: new Date().toLocaleString(),
        comment_content: commentText
    });

    // Save the new comment to the database
    newComment.save()
        .then(savedComment => {
            console.log('New comment saved:', savedComment);
            res.redirect(`/post/${postId}`); // Redirect back to the post page after successful submission
        })
        .catch(error => {
            console.error('Error saving comment:', error);
            res.status(500).send('Error saving comment');
        });
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

server.post('/likeEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { $inc: { event_likes: 1 } }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const likes = parseInt(updatedEvent.event_likes);
        res.json({ likes });
    } catch (error) {
        console.error('Error liking event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.post('/dislikeEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { $inc: { event_dislikes: 1 } }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const dislikes = parseInt(updatedEvent.event_dislikes);
        res.json({ dislikes });
    } catch (error) {
        console.error('Error disliking event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define a schema for the counter collection for event_id
const eventCounterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 1 }
});

// Create a model for the counter collection for event_id
const eventCounterModel = mongoose.model('eventCounter', eventCounterSchema);

// Function to get the next value of the counter for event_id and increment it
// Function to get the next value of the counter for event_id and increment it
async function getNextEventId() {
    try {
        // Get the last event from the database
        const lastEvent = await eventModel.findOne().sort({ event_id: -1 });

        let nextEventId = 1; // Default value if no events are in the database

        if (lastEvent) {
            nextEventId = parseInt(lastEvent.event_id) + 1;
        }

        console.log('Last Event:', lastEvent);
        console.log('Next Event ID:', nextEventId);

        return nextEventId;
    } catch (error) {
        console.error('Error getting next event ID:', error);
        throw error; // Propagate the error for handling in the calling function
    }
}

// Route handler to get the number of events in the database
server.get('/getNumEvents', async function (req, res) {
    try {
        const numEvents = await eventModel.countDocuments();
        res.json(numEvents);
    } catch (error) {
        console.error('Error getting number of events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


server.post('/submitEvent', async function (req, res) {
    try {
        const { eventTitle, eventPoster, eventDate, eventContent, eventType } = req.body;

        // Get the number of events in the database
        const numEventsResponse = await fetch('http://localhost:9090/getNumEvents');
        if (!numEventsResponse.ok) {
            throw new Error('Failed to get the number of events');
        }
        const numEvents = await numEventsResponse.json();

        // Parse the number of events to an integer
        const numEventsInt = parseInt(numEvents);

        // Create new event document
        const newEvent = new eventModel({
            _id: new mongoose.Types.ObjectId(),
            event_title: eventTitle,
            event_poster: eventPoster,
            event_date: eventDate,
            event_content: eventContent,
            event_likes: 0, 
            event_dislikes: 0, 
            event_type: eventType, 
            visible: true,
            // Convert the event ID back to a string
            event_id: (numEventsInt + 1).toString()
        });

        // Save the new event to the database
        const savedEvent = await newEvent.save();
        console.log('New event saved:', savedEvent);
        res.redirect('/events'); 
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).send('Error saving event');
    }
});


server.get('/getNextEventId', async function (req, res) {
    try {
        const nextEventId = await getNextSequenceValue('event_id');
        res.json(nextEventId);
    } catch (error) {
        console.error('Error getting next event ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

server.post('/deleteEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;
    try {
        const updatedEvent = await eventModel.findOneAndUpdate({ event_id: eventId }, { visible: false }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.redirect('/events');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

server.get('/profile/:post_author', function (req, res) {
    const searchQuery = req.params.post_author;
    profileModel.findOne({ profile_name: searchQuery }).lean().then(function (profile) {
        postModel.find({ post_author: searchQuery }).lean().then(function (post) {
            if (profile) {
                res.render('profile', {
                    layout: 'index',
                    title: 'UniWall Profile',
                    profile: profile, 
                    post: post
                });
            } else {
                res.status(404).send('Profile not found');
            }
        }).catch(errorFn);
    });
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

function finalClose(){
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM',finalClose);
process.on('SIGINT',finalClose);
process.on('SIGQUIT', finalClose);

const port = process.env.PORT || 9090;
server.listen(port, function () {
    console.log('Listening at port ' + port);
});
