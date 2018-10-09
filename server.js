
var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var flash = require('express-flash');
app.use(flash());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose', { useNewUrlParser: true });

var CatSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, required: true, minlength: 4 },
    color: { type: String, required: true },
    legs: { type: Number, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'} })

mongoose.model('Cat', CatSchema);
var Cat = mongoose.model('Cat')


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');



app.get('/', function (req, res) {
    Cat.find({}, function (err, cats) {
        if (err) {
            console.log(err)
        }
        //console.log(cats)
        res.render('index', { cats: cats });
    })
})


app.get('/cats/new', function (req, res) {
    res.render('new');
})


app.get('/cats/:id', function (req, res) {

    Cat.findOne({_id: req.params.id}, function(err, info){
        if (err) {
            console.log(err)
            res.redirect('/cats/new');
        } else {
            //console.log(info)
            res.render('profile', info);
        }
    })
})



app.post('/cats', function (req, res) {

    var cat = new Cat({ name: req.body.name, age: req.body.age, gender: req.body.gender, color: req.body.color, legs: req.body.legs });

    cat.save(function (err) {
        if (err) {
            console.log('something went wrong');
            for(var key in err.errors){
                req.flash('adding', err.errors[key].message);
            }
            res.redirect('/cats/new');
        } else {
            res.redirect('/');
        }
    })
})


app.get('/cats/edit/:id', function (req, res) {

    Cat.findOne({_id: req.params.id}, function(err, info){
        if (err) {
            console.log(err)
            res.redirect('/cats/'+req.params.id);
        } else {
            //console.log(info)
            res.render('edit', info);
        }
    })
})


app.post('/cats/:id', function (req, res) {

    Cat.updateOne({_id: req.params.id}, { name: req.body.name, age: req.body.age, gender: req.body.gender, color: req.body.color, legs: req.body.legs }, function(err, info){
        if (err) {
            console.log(err)
            res.redirect('/cats/edit/'+req.params.id);
        } else {
            //console.log(info)
            res.redirect('/cats/'+req.params.id);
        }
    })
})


app.get('/cats/destroy/:id', function (req, res) {

    Cat.deleteOne({_id: req.params.id}, function(err, info){
        if (err) {
            console.log(err)
            res.redirect('/cats/'+req.params.id);
        } else {
            //console.log("deleted", info)
            res.redirect('/');
        }
    })
})


app.listen(8000, function () {
    console.log("listening on port 8000");
})