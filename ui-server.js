/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var path       = require('path');
var hbs = require('hbs');
var hbsutils = require('hbs-utils')(hbs);
var port = process.env.PORT || 3001;


app.use(express.static(path.join(__dirname,'static')));

//================================= Templating Engine https://www.npmjs.com/package/hbs
app.set('view engine', 'hbs');
app.set('views', __dirname + '/pages');
hbs.registerPartials(__dirname + '/components');
hbs.registerPartials(__dirname + '/components/alchemy');

//================================= Routes
var uiRouter = express.Router();

uiRouter.get('/', function(req, res){
    res.render('index', { title: 'Hey', message: 'Hello there!' });
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