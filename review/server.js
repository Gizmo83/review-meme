// We will try to make a basic version of this.
// https://imgflip.com/memegenerator
// https://api.imgflip.com/

// Prepare starter files
// 1. server.js - go through password and db name
// 2. npm init -y
// 3. install and require all dependencies
//    -express, body-parser, request, mysql
// 4. Set up handlebars files
//    -views folder, layouts main.handlebars(add jquery, bootstrap, css), index.handlebars
// 5. Explain the static setup and create public folder and add css
// 6. create DB - You don't need to do this yet but I like to just create it first since I'm setting up the server.
//    -Go through schema.sql file
//    -Check if everything is connected
// 7. Begin GET request to get data to send to index page

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
    // save formatted object into a variable
    memes = JSON.parse(body).data.memes;
    //console.log(memes);

    //Now we have the info we need to send it to the front-end.  Create index.handlebars page.  
    res.render("index", { memes });  
  });
});


//** CREATE MEME PAGE */
//** So now we want to select one of the images to create the meme with.  How will we do that?  Go back to index.handlebars and turn the images to a link. */
//** FIND A MATCH FOR THE SELECTED IMAGE */
var selectedMeme;

//** Here we have a GET to grab the image ID from req.params.img */
app.get("/create/:img", function(req, res) {
    console.log(req.params.img);

//** Here we run a for loop to get all the info back for the selected meme.*/    
    for (var i=0; i < memes.length; i++) {
        if (req.params.img === memes[i].id) {
            selectedMeme = memes[i];
        }
    }

    console.log("selectedMeme: ", selectedMeme);
//** Now that we have all the info for the selected meme we'll send that info to the create page.  */ 
    res.render("create", { selectedMeme })
});

//** POST REQUEST TO CREATE MEME*/

var completedMeme;

//** All the info from the form can be see in req.body */
app.post("/meme", function(req, res) {
    console.log(req.body);
    
//** Here we send a POST to the API with the info they need to generate meme */
    request.post({url:"https://api.imgflip.com/caption_image", form: req.body}, function(err, response, body) {
        if (err) {
            throw err;
        }
        console.log(JSON.parse(body).data);

//** We save the data into a variable to be used later */
        completedMeme = JSON.parse(body).data;
//** Here we can res.render a new page and see the meme and be done.  Switch to redirect AFTER save function.  Because we want to be able to view the saved memes on this page we will run the redirect below and let the GET request pull the info. */
        //res.render("meme", {completedMeme});
//** Here we redirect the user to the /meme page to display the completed meme.  But we need to create a GET request  */
        res.redirect("/meme");
    })
});

//** POST REQUEST TO DATABASE TO SAVE MEME */

app.post("/save", function(req, res) {
//** we console req.body to check the data we're passing back is correct.  Now we run a mysql INSERT to save the info. Check the database to see if it's in there.*/
  console.log(req.body)
  connection.query("INSERT INTO memes SET ?", [req.body], function(err, result) {
      if (err) {
          throw err;
      }
//** just sending something back to close the connection. */
      res.json(result);
  })
});


//** Now we want to run a GET request to get all the saved memes.  Since we're using the same page as the completed meme page change the POST to res.redirect and let the GET request render the page. */
//** COMPLETED MEME PAGE */
//** GET REQUEST TO GET SAVED MEMES WHEN IT HITS THIS ROUTE*/
app.get("/meme", function(req, res) {
    var saved = [];

//** QUERY database to get all the saved memes if they exist */
    connection.query("SELECT * FROM memes", function(err, data) {
        console.log(data);
        if (err) {
            throw err;
        }
//** Here we have a condition to check if there any saved memes.   */
        if (data.length > 0) {
            for (var i=0; i < data.length; i++) {
                saved.push(data[i]);
            }
            console.log("this is saved: ", saved)
//** if there is saved memes we want to send that to the meme page.  Created saved section on meme.handlebars */
            res.render("meme", {completedMeme, saved})
        } else {
            res.render("meme", {completedMeme})
        }
    })

});


//** DELETE REQUEST TO DELETE MEME */
app.delete("/delete/:id", function(req, res) {

    connection.query("DELETE FROM memes WHERE id = ?", [req.params.id], function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    } )
})