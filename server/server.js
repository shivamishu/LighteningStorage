let cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
var fileUpload = require("express-fileupload");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use("/", express.static(__dirname + "/public/webapp"));
//fileupload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "tmp",
  })
);
// Allow cross origin requests
var router = express.Router();
var api_route = require("./routes/api_route");
var authMiddleware = require("./auth/authMiddleware");
// deafult
app.use("/api", router);

// test route
router.get("/", function (req, res) {
  console.log("default route called");
  res.render("index.html");
  // res.json({
  //   message: "welcome to AWS Project 1",
  // });
});

//api route for upload file
router.post("/upload_file", authMiddleware.Validate, api_route.upload_file);

//api route for read fiels
// authMiddleware.Validate
router.get("/read_files", authMiddleware.Validate, api_route.read_files);

//api route for update file
router.put("/update_file", authMiddleware.Validate, api_route.update_file);

//api route to delete file
router.delete("/delete_file", authMiddleware.Validate, api_route.delete_file);

// port added | Run Server
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
