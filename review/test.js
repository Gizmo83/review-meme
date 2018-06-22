// Prepare starter files
// 1. server.js
// 2. npm init -y
// 3. install and require all dependencies
//   -express, body-parser, request, mysql
// 4. Set up handlebars files
//   -views folder, layouts main.handlebars(add jquery, bootstrap, css), index.handlebars
// 5. create DB

var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mysql = require("mysql");
var app = express();
var exphbs = require("express-handlebars");

//** SERVER SETUP

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "meme_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});

//** END SERVER SETUP

//** STATIC FOLDER SETUP*/
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));


//** Start Page GET request from API
var memes; // I'm going to declare the variable outside so i can use it later.

// Root get route.
app.get("/", function(req, res) {
  request("https://api.imgflip.com/get_memes", function(err, response, body) {
    if (err) {
      throw err;
    }
    console.log(body); //Comes back all crazy looking because it's a string.
    //console.log(JSON.parse(body).data); //Here we JSON.parse so we can understand the code
    memes = JSON.parse(body).data.memes;
    //console.log(memes);

    //Now we have the info we need to send it to the front-end.  
    res.render("index", { meme: memes });  
  });
});


// //** CREATE MEME PAGE */
// //** FIND A MATCH FOR THE SELECTED IMAGE */
// var selectedMeme;

// app.get("/create/:img", function(req, res) {
//     //console.log(req.params.img);

//     for (var i=0; i < memes.length; i++) {
//         if (req.params.img === memes[i].id) {
//             selectedMeme = memes[i];
//         }
//     }

//     //console.log(selectedMeme);
//     res.render("create", { meme: selectedMeme })
// });

// //** POST REQUEST TO CREATE MEME*/

// var completedMeme;

// app.post("/meme", function(req, res) {
//     console.log(req.body);

//     request.post({url:"https://api.imgflip.com/caption_image", form: req.body}, function(err, response, body) {
//         if (err) {
//             throw err;
//         }
//         console.log(JSON.parse(body).data);
//         completedMeme = JSON.parse(body).data;
//         res.json(completedMeme);
//     })
// });

// //** COMPLETED MEME PAGE */
// //** GET REQUEST TO GET SAVED MEMES */
// app.get("/meme", function(req, res) {
//     var saved = [];
//     connection.query("SELECT * FROM memes", function(err, data) {
//         if (err) {
//             throw err;
//         }

//         if (data.length > 0) {
//             for (var i=0; i < data.length; i++) {
//                 saved.push({url: data[i].url, id: data[i].id})
//             }
//             console.log("this is saved: ", saved[0])
//             res.render("meme", {completedMeme:completedMeme, save: saved})
//         } else {
//             res.render("meme", {completedMeme:completedMeme})
//         }
//     })

// });

// //** POST REQUEST TO DATABASE TO SAVE MEME */

// app.post("/save", function(req, res) {
//     console.log(req.body)
//     connection.query("INSERT INTO memes SET ?", [req.body], function(err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//     })
// })

// //** DELETE REQUEST TO DELETE MEME */
// app.delete("/delete/:id", function(req, res) {

//     connection.query("DELETE FROM memes WHERE id = ?", [req.params.id], function(err, result) {
//         if (err) {
//             throw err;
//         }
//         res.json(result);
//     } )
// })