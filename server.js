var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "meme_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

var memes;
var selectedMeme;

// Root get route.
app.get("/", function(req, res) {
  request("https://api.imgflip.com/get_memes", function(err, response, body) {
    if (err) {
      throw err;
    }

    //console.log(JSON.parse(body).data);
    memes = JSON.parse(body).data.memes;
    console.log(memes);
    res.render("index", { meme: memes });
  });
});

app.get("/create/:img", function(req, res) {
    //console.log(req.params.img);

    for (var i=0; i < memes.length; i++) {
        if (req.params.img === memes[i].id) {
            selectedMeme = memes[i];
        }
    }

    //console.log(selectedMeme);
    res.render("create", { meme: selectedMeme })
})

var completedMeme;

app.post("/meme", function(req, res) {
    console.log(req.body);

    request.post({url:"https://api.imgflip.com/caption_image", form: req.body}, function(err, response, body) {
        if (err) {
            throw err;
        }
        console.log(JSON.parse(body).data);
        completedMeme = JSON.parse(body).data;
        res.json(completedMeme);
    })
});

app.get("/meme", function(req, res) {
    var saved = [];
    connection.query("SELECT * FROM memes", function(err, data) {
        if (err) {
            throw err;
        }

        if (data.length > 0) {
            for (var i=0; i < data.length; i++) {
                saved.push({url: data[i].url, id: data[i].id})
            }
            console.log("this is saved: ", saved[0])
            res.render("meme", {completedMeme:completedMeme, save: saved})
        } else {
            res.render("meme", {completedMeme:completedMeme})
        }
    })

})

app.post("/save", function(req, res) {
    console.log(req.body)
    connection.query("INSERT INTO memes SET ?", [req.body], function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    })
})

app.delete("/delete/:id", function(req, res) {

    connection.query("DELETE FROM memes WHERE id = ?", [req.params.id], function(err, result) {
        if (err) {
            throw err;
        }
        res.json(result);
    } )
})



// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});