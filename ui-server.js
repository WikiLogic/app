/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var path       = require('path');
var exphbs     = require('express-handlebars');
var port       = process.env.PORT || 3001;

//db connections: n n

app.use(express.static(path.join(__dirname,'static')));


//================================= Templating Engine https://www.npmjs.com/package/express-handlebars
var hbs = exphbs.create({ 
    layoutsDir: 'views/layouts/',
    partialsDir: 'views/components/',
    defaultLayout: 'default',
    extname: '.hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');


//================================= Routes
var uiRouter = express.Router();

uiRouter.get('/', function(req, res){
    //To render with a different layout:  
    //res.render('home', { title: 'Hey', message: 'Hello there!', layout: 'layouts/file-name.hbs' });
    res.render('home', { title: 'Hey', message: 'Hello there!' });
});

uiRouter.get('/statistics', function(re, res){

});

uiRouter.get('/claim-detail/:id', function(re, res){

});

uiRouter.get('/work-space/:id', function(re, res){

});

uiRouter.get('/my-profile', function(re, res){

});

app.use('/', uiRouter);



//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);