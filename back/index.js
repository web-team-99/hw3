// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var body_parser = require('body-parser');
var cors = require('cors');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'id',
  masterKey: process.env.MASTER_KEY || 'masterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://127.0.0.1:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// // Serve static assets from the /public folder
// app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use(body_parser.urlencoded({extended: true}));
app.use(cors());

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});



app.get('/api/signup', function(req, res){
  res.status(405).send({'message': "Only `Post` Method is Valid"});
});

app.post('/api/signup', function(req, res){
  console.log(req.body);
  var email = req.body.email;
  var pass = req.body.password;
  
  if(email === undefined || pass === undefined){
    sendResponse(res, 400, {'message': 'Request Length should be 2'});
    return;
  }
  if(pass.length < 5){
    sendResponse(res, 400, {"message": "filed `password`.length should be gt 5"});
    return;
  }

  var regex = /\w+@\w+\.[a-z]+/g;
  var ver = regex.test(email);
  // console.log(ver);
  if(!ver){
    sendResponse(res, 400, {"message": "field `email` is not valid"});
    return;
  }

  var user = new Parse.User();
  user.set("username", email);
  user.set("password", pass);
  (async () => {
    try{
      await user.signUp();
      sendResponse(res, 201, {"message": "user has been created."});
    }
    catch(err){
      if(err.code == 202){
        sendResponse(res, 409, {"message": "email already exist."});
      }
      
    }
  })();
});

app.get('/api/signin', function(req, res){
  // res.status(200).send('Signin success.');
});

function sendResponse(res, statusCode, response){
  res.status(statusCode).send(response);
}


var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
