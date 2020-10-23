"use strict";
var _ = require("lodash");
var fs = require("fs"),
  AWS = require("aws-sdk"),
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  });
// var con = require("./dbconnconfig.js");
var dbOperations = require("./dbOperations.js");
//database operations

function getUserDetails(res) {
  var user_id = "",
    user_name = "";
  if (!res.locals.user) {
    return res.status(400).send("User not available.");
  }
  res.locals.user.UserAttributes.forEach((attr) => {
    if (attr.Name === "email") {
      user_id = attr.Value;
    }
    if (attr.Name === "name") {
      user_name = attr.Value;
    }
  });
  return { user_id: user_id, user_name: user_name };
}

// Upload a file to s3 Bucket
exports.upload_file = async function (req, res) {
  var oUserDetails = getUserDetails(res),
    user_id = oUserDetails.user_id,
    user_name = oUserDetails.user_name,
    fname = user_name.split(" ").slice(0, -1).join(" "),
    lname = user_name.split(" ").slice(-1).join(" ");
  // console.log("Uploading a file to S3 Bucket");
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  // TODO: Add support for multiple file uploads
  // console.log("req.files >>>", req.files); // eslint-disable-line
  const inputFile = req.files.fileToUpload;
  if (_.isEmpty(inputFile)) {
    return res.status(400).send("No files were uploaded.");
  }

  const fileName =
    req.body.utime.split("").reverse().join("") + "-" + inputFile.name; //new unique file name
  const fileContent = fs.readFileSync(inputFile.tempFilePath);
  const mimeType = inputFile.mimetype;
  const fileSize = inputFile.size;
  const url = `${process.env.AWS_CLOUD_FRONT}${fileName}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    ContentType: inputFile.mimetype,
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      res.status(400).send(err);
    }
    const user_input = {
      user_id: user_id,
      filename: fileName,
      fname: fname,
      lname: lname,
      utime: req.body.utime,
      ctime: req.body.ctime,
      description: req.body.description,
      file_url: url,
      mimetype: mimeType,
      size: fileSize,
    };
    dbOperations.uploadFile(req, res, user_input);
  });
};

// read the exisitng files for the current user
exports.read_files = async function (req, res) {
  // console.log("Reading files for the user");
  var oUserDetails = getUserDetails(res),
    user_id = oUserDetails.user_id,
    user_name = oUserDetails.user_name,
    fname = user_name.split(" ").slice(0, -1).join(" "),
    lname = user_name.split(" ").slice(-1).join(" ");
  //Handling Admin Mode
  const isAdmin = user_id === process.env.ADMIN ? true : false;
  const user_input = { user_id: user_id, fname: fname, lname: lname };
  dbOperations.readFiles(req, res, user_input);
};

// update the exisitng file for the current user
exports.update_file = async function (req, res) {
  var oUserDetails = getUserDetails(res),
    user_id = oUserDetails.user_id,
    user_name = oUserDetails.user_name,
    fname = user_name.split(" ").slice(0, -1).join(" "),
    lname = user_name.split(" ").slice(-1).join(" ");
  // console.log("Updating existing file to S3 Bucket");
  if (!req.files) {
    return res.status(400).send("No files were updated.");
  }
  // console.log("req.files >>>", req.files); // eslint-disable-line
  const inputFile = req.files.fileToUpload;
  if (_.isEmpty(inputFile)) {
    return res.status(400).send("No files were uploaded.");
  }
  const fileName = req.body.filename; //existing file name
  const fileContent = fs.readFileSync(inputFile.tempFilePath);
  const fileSize = inputFile.size; //updated size
  const mimeType = inputFile.mimetype;
  const url = `${process.env.AWS_CLOUD_FRONT}${fileName}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    ContentType: inputFile.mimetype,
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      res.status(400).send(err);
    }
    const user_input = {
      user_id: user_id,
      filename: fileName,
      fname: fname,
      lname: lname,
      utime: req.body.utime,
      ctime: req.body.ctime,
      description: req.body.description,
      file_url: url,
      mimetype: mimeType,
      size: fileSize,
    };
    dbOperations.updateFile(req, res, user_input);
  });
};

// delete the exisitng file for the current user
exports.delete_file = async function (req, res) {
  var oUserDetails = getUserDetails(res),
    user_id = oUserDetails.user_id;

  // console.log("Updating existing file to S3 Bucket");
  // TODO: Add support to delete multiple files
  const fileName = req.body.filename; //existing file name
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
  };

  s3.deleteObject(params, function (err, data) {
    if (err) {
      res.status(400).send(err);
    }
    const user_input = { user_id: user_id, filename: fileName };
    dbOperations.deleteFile(req, res, user_input);
  });
};
