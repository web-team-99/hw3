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
  masterKey: process.env.MASTER_KEY || "masterKey", 
  serverURL: process.env.SERVER_URL || "http://127.0.0.1:1337/parse",
  liveQuery: {
    classNames: ["Posts", "Comments"]
  }
});

var app = express();

var mountPath = process.env.PARSE_MOUNT || "/parse";
app.use(mountPath, api);
app.use(body_parser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/admin/', authenticateToken);

Parse.Cloud.beforeSave(Parse.User, async (request) => {
  let obj = request.object;
  if (!request.original) {
    obj.setACL(new Parse.ACL(Parse.User.current()));
  }
});



// signup
app.get("/api/signup", function (req, res) {
  res.status(405).send({ "message": "Only `Post` Method is Valid" });
});

app.post("/api/signup", function (req, res) {
  var email = req.body.email;
  var pass = req.body.password;

  if (email === undefined || pass === undefined) {
    sendResponse(res, 400, { "message": "Request Length should be 2" });
    return;
  }
  if (pass.length < 5) {
    sendResponse(res, 400, {
      "message": "filed `password`.length should be gt 5"
    });
    return;
  }

  if (!validateEmail(email)) {
    sendResponse(res, 400, { "message": "field `email` is not valid" });
    return;
  }

  let user = new Parse.User();
  user.set("username", email);
  user.set("password", pass);

  user.signUp()
    .then(() => {
      sendResponse(res, 201, { "message": "user has been created." });
      return;
    })
    .catch(err => {
      handleParseError(res, err);
    });
});


// signin
app.get("/api/signin", function (req, res) {
  res.status(405).send({ "message": "Only `Post` Method is Valid" });
});

app.post("/api/signin", function (req, res) {
  let email = req.body.email;
  let pass = req.body.password;

  if (email == undefined || pass == undefined) {
    sendResponse(res, 400, { "message": "Request Length should be 2" });
    return;
  }

  if (!validateEmail(email)) {
    sendResponse(res, 400, { "message": "filed `email` is not valid" });
    return;
  }

  Parse.User.logIn(email, pass)
    .then((user) => {
      sendResponse(res, 200, { "token": user.getSessionToken() });
      return;
    })
    .catch(err => {
      handleParseError(res, err);
    });

});


// post index
app.get("/api/post", function (req, res) {
  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  query.findAll()
    .then(result => {
      let response = [];
      (async () => {
        for (const object of result) {
          await object.fetch().then(a => {
            let year = a.createdAt.getFullYear();
            let month = (a.createdAt.getMonth() % 12) + 1;
            let date = a.createdAt.getDate();
            let created_at = year + "/" + month + "/" + date;

            response.push({
              "id": a.id,
              "title": a.attributes.title,
              "content": a.attributes.content,
              "created_by": a.attributes.created_by.id,
              "created_at": created_at
            });
          });
        }
      })()
        .then(() => {
          sendResponse(res, 200, { "posts": response });
        });
    })
    .catch(err => {
      handleParseError(res, err);
    });
});


// create post
app.post("/api/admin/post/crud", function (req, res) {
  let title = req.body.title;
  let content = req.body.content;

  if (content === undefined || title === undefined) {
    sendResponse(res, 400, { "message": "Request Length should be 2" });
    return;
  }
  if (title.trim().length < 1) {
    sendResponse(res, 400, {
      "message": "filed `title` is not valid"
    });
    return;
  }

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const post = new Post();
  post.set("title", title);
  post.set("content", content);
  post.set("created_by", user);

  let ACL = new Parse.ACL();
  ACL.setPublicReadAccess(true);
  ACL.setPublicWriteAccess(false);
  ACL.setWriteAccess(user, true);
  post.setACL(ACL);

  post.save()
    .then(() => {
      sendResponse(res, 201, { "message": "post has been created." });
    })
    .catch(err => {
      handleParseError(res, err);
    });

});


// read post by id
app.get("/api/admin/post/crud/:id", function (req, res) {
  const Post = Parse.Object.extend("Post");
  let id = req.params.id;
  const query = new Parse.Query(Post);
  query.get(id).then(
    function (post) {
      let year = post.createdAt.getFullYear();
      let month = (post.createdAt.getMonth() % 12) + 1;
      let date = post.createdAt.getDate();
      let created_at = year + "/" + month + "/" + date;

      response = {
        "id": post.id,
        "title": post.attributes.title,
        "content": post.attributes.content,
        "created_by": post.attributes.created_by.id,
        "created_at": created_at
      };
      sendResponse(res, 201, { post: response });
      return;
    },
    function () {
      sendResponse(res, 400, { "message": "url id is not valid" });
      return;
    }
  );
});


// read post by user
app.get("/api/admin/post/crud", function (req, res) {
  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);
  query.equalTo("created_by", Parse.User.current());
  query.find().then(result => {
    let response = [];
    (async () => {
      for (const object of result) {
        await object.fetch().then(a => {
          let year = a.createdAt.getFullYear();
          let month = (a.createdAt.getMonth() % 12) + 1;
          let date = a.createdAt.getDate();
          let created_at = year + "/" + month + "/" + date;

          response.push({
            "id": a.id,
            "title": a.attributes.title,
            "content": a.attributes.content,
            "created_by": a.attributes.created_by.id,
            "created_at": created_at
          });
        });
      }
    })()
      .then(() => {
        sendResponse(res, 200, { "posts": response });
      });
  })
  .catch(err => {
    handleParseError(res, err);
  });
});


// update post invalid id
app.put("/api/admin/post/crud", function (req, res) {
  sendResponse(res, 400, { "message": "url id is not valid" });
});


// update post
app.put("/api/admin/post/crud/:id", function (req, res) {
  let id = req.params.id;
  let title = req.body.title;
  let content = req.body.content;

  if (content === undefined || title === undefined) {
    sendResponse(res, 400, { "message": "Request Length should be 2" });
    return;
  }
  if (title.trim().length == 0) {
    sendResponse(res, 400, {
      "message": "filed `title` is not valid"
    });
    return;
  }

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  query.get(id).then(
    function (post) {
      if( post.attributes.created_by.id !== user.id){
        sendResponse(res, 401, { "message": "permission denied." });
        return;
      }

      post.set("title", title);
      post.set("content", content);
      post.save();
      sendResponse(res, 204);
    }
    // ,function () {
    //   sendResponse(res, 400, { "message": "url id is not valid" });
    //   return;
    // }
  )
  .catch( err => {
    handleParseError(res, err);
  });
});


// delete post invalid id
app.delete("/api/admin/post/crud", function (req, res) {
  sendResponse(res, 400, { "message": "url id is not valid" });
});


// delete post
app.delete("/api/admin/post/crud/:id", function (req, res) {
  let id = req.params.id;

  const user = Parse.User.current();

  const Post = Parse.Object.extend("Post");
  const query = new Parse.Query(Post);

  query.get(id).then(
    function (post) {
      if( post.attributes.created_by.id !== user.id){
        sendResponse(res, 401, { "message": "permission denied." });
        return;
      }
      post.destroy();
      sendResponse(res, 204);
    }
    // ,function () {
    //   sendResponse(res, 400, { "message": "url id is not valid" });
    //   return;
    // }
  )
  .catch( (err) => {
    handleParseError(res, err);
  });
});


// read user invalid id
app.get("/api/admin/user/crud", function (req, res) {
  sendResponse(res, 400, { "message": "url id is not valid" });
});


// read user
app.get("/api/admin/user/crud/:id", function (req, res) {
  // const Post = Parse.Object.extend("Post");
  let id = req.params.id;
  const user = Parse.User.current();

  if (id !== user.id) {
    sendResponse(res, 401, { "message": "Permission denied." });
    return;
  }

  const query = new Parse.Query(Parse.User);
  query.get(id).then(
    function (user) {
      let year = user.createdAt.getFullYear();
      let month = (user.createdAt.getMonth() % 12) + 1;
      let date = user.createdAt.getDate();
      let created_at = year + "/" + month + "/" + date;

      response = {
        "id": user.id,
        "email": user.attributes.username,
        "created_at": created_at
      };
      sendResponse(res, 201, { "user": response });
      return;
    }
  //   ,function () {
  //     sendResponse(res, 400, { "message": "url id is not valid" });
  //     return;
  //   }
  )
    .catch((err) => {
      handleParseError(res, err);
    });
});


// read current user
app.get("/api/admin/cuser/crud", function (req, res) {
  // console.log(req.params.id);
  // const Post = Parse.Object.extend("Post");
  // let id = req.params.id;
  const user = Parse.User.current();

  // if (id !== user.id) {
  //   sendResponse(res, 401, { "message": "Permission denied." });
  //   return;
  // }

  // const query = new Parse.Query(Parse.User);
  // query.get(id).then(
    // function (user) {
      let year = user.createdAt.getFullYear();
      let month = (user.createdAt.getMonth() % 12) + 1;
      let date = user.createdAt.getDate();
      let created_at = year + "/" + month + "/" + date;

      response = {
        "id": user.id,
        "email": user.attributes.username,
        "created_at": created_at
      };
      sendResponse(res, 201, { "user": response });
      return;
    // }
  //   ,function () {
  //     sendResponse(res, 400, { "message": "url id is not valid" });
  //     return;
  //   }
  // )
    // .catch((err) => {
      // handleParseError(res, err);
    // });
});



function sendResponse(res, statusCode, response) {
  res.status(statusCode).send(response);
}

function validateEmail(email) {
  var regex = /\w+@\w+\.[a-z]+/g;
  let ver = regex.test(email);
  return ver;
}

function authenticateToken(req, res, next) {
  let token = req.header('auth-token');

  if(!token){
    sendResponse(res, 401, { "message": "Invalid session token." });
    return;
  }
  Parse.User.enableUnsafeCurrentUser();
  Parse.User.become(token).then((user) => {
    next();
  })
    .catch((err) => {
      handleParseError(res, err);
    });
}

// Constansts
const ACCOUNT_ALREADY_EXISTS = "Account already exists for this username.";
const INVALID_USER_PASS = "Invalid username/password.";
const INVALID_SESSION_TOKEN = "Invalid session token.";
const OBJECT_NOT_FOUND = "Object Not Found.";


function handleParseError(res, err) {
  console.log(err.code + " ::: " + err.message);
  switch (err.message) {
    case INVALID_SESSION_TOKEN:
      sendResponse(res, 401, { "message": "Invalid session token." });
      break;
    case INVALID_USER_PASS:
      sendResponse(res, 401, { "message": "Wrong email or password." });
      break;
    case ACCOUNT_ALREADY_EXISTS:
      sendResponse(res, 409, { "message": "email already exist." });
      break;
    case OBJECT_NOT_FOUND:
      sendResponse(res, 400, { "message": "url id is not valid" });
      break;
    default:
      sendResponse(res, 405, { "message": err.message });
  }
}

var port = process.env.PORT || 1337;
var httpServer = require("http").createServer(app);
httpServer.listen(port, function () {
  console.log("parse-server-example running on port " + port + ".");
});
