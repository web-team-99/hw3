// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require("express");
var ParseServer = require("parse-server").ParseServer;
var path = require("path");
var body_parser = require("body-parser");
var cors = require("cors");

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log("DATABASE_URI not specified, falling back to localhost.");
}

var api = new ParseServer({
  databaseURI: databaseUri || "mongodb://localhost:27017/dev",
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
  appId: process.env.APP_ID || "id",
  masterKey: process.env.MASTER_KEY || "masterKey", //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || "http://127.0.0.1:1337/parse", // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});


var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || "/parse";
app.use(mountPath, api);
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/admin/', authenticateToken);

// Parse Server plays nicely with the rest of your web routes
app.get("/", function(req, res) {
  res
    .status(200)
    .send(
      "I dream of being a website.  Please star the parse-server repo on GitHub!"
    );
});

const ACCOUNT_ALREADY_EXISTS = 202;
const INVALID_USER_PASS = 101;

// signup
app.get("/api/signup", function(req, res) {
  res.status(405).send({ message: "Only `Post` Method is Valid" });
});

app.post("/api/signup", function(req, res) {
  console.log(req.body);
  var email = req.body.email;
  var pass = req.body.password;

  if (email === undefined || pass === undefined) {
    sendResponse(res, 400, { message: "Request Length should be 2" });
    return;
  }
  if (pass.length < 5) {
    sendResponse(res, 400, {
      message: "filed `password`.length should be gt 5"
    });
    return;
  }

  if (!validateEmail(email)) {
    sendResponse(res, 400, { message: "field `email` is not valid" });
    return;
  }

  let user = new Parse.User();
  user.set("username", email);
  user.set("password", pass);
  (async () => {
    await user.signUp();
  })()
    .then(() => {
      sendResponse(res, 201, { message: "user has been created." });
      return;
    })
    .catch(err => {
      if (err.code == ACCOUNT_ALREADY_EXISTS) {
        sendResponse(res, 409, { message: "email already exist." });
        return;
      }
    });
});

// signin
app.get("/api/signin", function(req, res) {
  res.status(405).send({ message: "Only `Post` Method is Valid" });
});

app.post("/api/signin", function(req, res) {
  let email = req.body.email;
  let pass = req.body.password;

  if (email == undefined || pass == undefined) {
    sendResponse(res, 400, { message: "Request Length should be 2" });
    return;
  }

  if (!validateEmail(email)) {
    sendResponse(res, 400, { message: "filed `email` is not valid" });
    return;
  }

  let user;
  (async () => {
    user = await Parse.User.logIn(email, pass, { usePost: true });
  })()
    .then(() => {
      sendResponse(res, 200, { token: user.getSessionToken() });
      // console.log(user.getSessionToken());
    })
    .catch(err => {
      if (err.code == INVALID_USER_PASS) {
        sendResponse(res, 401, { message: "wrong email or password." });
        return;
      }
      console.log(err);
    });
});

// post index
app.get("/api/post", function(req, res) {
  // const posts = Parse.Object.extend("Posts");
  // let post = Parse.Post
  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  // const obj = new posts();
  // obj.set("title", "title post 112221");
  // obj.set('content', 'content post 121122');
  // obj.set('created_by', 'user idk');

  // obj.save()
  // .then((obj) => {
  //   console.log(obj);
  // })
  // let response = [];
  // let result;

  (async () => {
    // return await query.findAll();
    const posts = await query.findAll();
    console.log(posts);
    return posts;
  })()
    .then(result => {
      // Parse.Object
      let response = [];
      (async () => {
        for (const object of result) {
          await object.fetch().then(a => {
            let year = a.createdAt.getFullYear();
            let month = (a.createdAt.getMonth() % 12) + 1;
            let date = a.createdAt.getDate();
            let created_at = year + "/" + month + "/" + date;

            response.push({
              id: a.id,
              title: a.attributes.title,
              content: a.attributes.content,
              // created_by: a.attributes.created_by.id,
              created_at: created_at
            });
          });
        }
      })().then(() => {
        console.log(response);
        sendResponse(res, 200, { posts: response });
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// create post
app.post("/api/admin/post/crud", function(req, res) {
  console.log(req.body);
  let title = req.body.title;
  let content = req.body.content;

  if (content === undefined || title === undefined) {
    sendResponse(res, 400, { message: "Request Length should be 2" });
    return;
  }
  if (title.trim().length < 1) {
    sendResponse(res, 400, {
      message: "filed `title` is not valid"
    });
    return;
  }

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const post = new Post();
  post.set("title", title);
  post.set("content", content);
  post.set("user", user);

  (async () => {
    await post.save();
  })()
    .then(() => {
      sendResponse(res, 201, { message: "post has been created." });
      return;
    })
    .catch(err => {
      console.log(err);
    });
});

// read post by id
app.get("/api/admin/post/crud/:id", function(req, res) {
  console.log(req.params.id);
  const Post = Parse.Object.extend("Post");
  let id = req.params.id;
  const query = new Parse.Query(Post);
  query.get(id).then(
    function(post) {
      let year = post.createdAt.getFullYear();
      let month = (post.createdAt.getMonth() % 12) + 1;
      let date = post.createdAt.getDate();
      let created_at = year + "/" + month + "/" + date;

      response = {
        id: post.id,
        title: post.attributes.title,
        content: post.attributes.content,
        // created_by: post.attributes.created_by.id,
        created_at: created_at
      };
      sendResponse(res, 201, { post: response });
      return;
    },
    function() {
      sendResponse(res, 400, { message: "url id is not valid" });
      return;
    }
  );
});

// read post by user
app.get("/api/admin/post/crud", function(req, res) {
  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);
});

// update post invalid id
app.put("/api/admin/post/crud", function(req, res) {
  sendResponse(res, 400, { message: "url id is not valid" });
});

// update post
app.put("/api/admin/post/crud/:id", function(req, res) {
  console.log(req.body, req.params.id);
  let id = req.params.id;
  let title = req.body.title;
  let content = req.body.content;

  if (content === undefined || title === undefined) {
    sendResponse(res, 400, { message: "Request Length should be 2" });
    return;
  }
  if (title.trim().length == 0) {
    sendResponse(res, 400, {
      message: "filed `title` is not valid"
    });
    return;
  }

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  query.get(id).then(
    function(post) {
      post.set("title", title);
      post.set("content", content);
      post.save();
      sendResponse(res, 204);
    },
    function() {
      sendResponse(res, 400, { message: "url id is not valid" });
      return;
    }
  );
});
let i = 0;
app.get('/api/admin/user/crud', function(req, res){
  
  console.log('handler get  '+ i++);

  console.log(Parse.User.current.getSessionToken);
});

// delete post invalid id
app.delete("/api/admin/post/crud", function(req, res) {
  sendResponse(res, 400, { message: "url id is not valid" });
});

// delete post
app.delete("/api/admin/post/crud/:id", function(req, res) {
  console.log(req.params.id);
  let id = req.params.id;

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  query.get(id).then(
    function(post) {
      post.destroy();
      sendResponse(res, 204);
    },
    function() {
      sendResponse(res, 400, { message: "url id is not valid" });
      return;
    }
  );
});

// read user invalid id
app.get("/api/admin/post/crud", function(req, res) {
  sendResponse(res, 400, { message: "url id is not valid" });
});

// read user
app.get("/api/admin/user/crud/:id", function(req, res) {
  console.log(req.params.id);
  // const Post = Parse.Object.extend("Post");
  let id = req.params.id;
  const query = new Parse.Query(Parse.User);
  query.get(id).then(
    function(user) {
      let year = user.createdAt.getFullYear();
      let month = (user.createdAt.getMonth() % 12) + 1;
      let date = user.createdAt.getDate();
      let created_at = year + "/" + month + "/" + date;

      response = {
        id: user.id,
        email: user.attributes.username,
        created_at: created_at
      };
      sendResponse(res, 201, { user: response });
      return;
    },
    function() {
      sendResponse(res, 400, { message: "url id is not valid" });
      return;
    }
  );
});

function sendResponse(res, statusCode, response) {
  res.status(statusCode).send(response);
}

function validateEmail(email){
  var regex = /\w+@\w+\.[postObject-z]+/g;
  let ver = regex.test(email); 
  return ver;
}

function authenticateToken(req, res, next){
  console.log(req.header('auth-token'));
  let token = req.header('auth-token');

  // let sessions = Parse.Object.extend('_Session');
  // let query = new Parse.Query(sessions);
  
  // (async () => {
  //   return await query.findAll();
  // })()
  // .then((result) => {
  //   console.log(result);
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
  let current = Parse.User.current;
  if(current !== undefined && current.getSessionToken !== token){
    sendResponse(res, 401, {"message": "permission denied."})
    return;
  }

  Parse.User.become(token).then(next());

  // console.log('middleware');
  // next();
}

var port = process.env.PORT || 1337;
var httpServer = require("http").createServer(app);
httpServer.listen(port, function() {
  console.log("parse-server-example running on port " + port + ".");
});

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
