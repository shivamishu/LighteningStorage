var _ = require("lodash");
var fs = require("fs"),
  AWS = require("aws-sdk"),
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  });
var con = require("./dbconnconfig.js");
//database operations
function performDatabaseOperations(
  req,
  res,
  fileName,
  sql_query,
  modeText,
  user_id,
  fname,
  lname
) {
  if (con.state === "connected" || con.state === "authenticated") {
    _performDBOperation(
      req,
      res,
      fileName,
      sql_query,
      modeText,
      null,
      user_id,
      fname,
      lname
    );
  } else {
    con.connect(function (err) {
      _performDBOperation(
        req,
        res,
        fileName,
        sql_query,
        modeText,
        err,
        user_id,
        fname,
        lname
      );
    });
  }
}
function _performDBOperation(
  req,
  res,
  fileName,
  sql_query,
  modeText,
  err,
  user_id,
  fname,
  lname
) {
  if (err) {
    // con.end();
    console.error("Database connection failed: " + err.stack);
    con.end();
    // res.status(400).send(err);
    // return;
  }
  // console.log("Connected to database.");
  con.query(sql_query, function (err, result, fields) {
    if (err) {
      // con.end();
      console.error(err.stack);
      res.send(err);
    } else {
      let msg = "";
      switch (modeText) {
        case "uploaded":
        case "updated":
          let url = `${process.env.AWS_CLOUD_FRONT}${fileName}`;
          msg = req.body;
          msg.user_id = user_id;
          msg.fname = fname;
          msg.lname = lname;
          msg.filename = fileName;
          msg.file_url = url;
          msg.mimetype = req.files.fileToUpload.mimetype;
          msg.size = req.files.fileToUpload.size;
          res.status(200).send(msg);
          break;
        case "read":
          // msg = JSON.stringify(result);
          msg = result;
          res
            .status(200)
            .send({ items: msg, name: fname + " " + lname, user_id: user_id });
          break;
        case "deleted":
          msg = `File ${fileName} ${modeText} successfully.`;
          res.sendStatus(200);
          break;
        default:
          msg = "default success";
          break;
      }
      // con.end();
    }
  });
}
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
    Date.now().toString().split("").reverse().join("") + "-" + inputFile.name; //new unique file name
  const fileContent = fs.readFileSync(inputFile.tempFilePath);
  const mimeType = inputFile.mimetype;
  const fileSize = inputFile.size;

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
    const insert_query = `INSERT INTO user_files (user_id, filename, fname, lname, utime, ctime, description, file_url, mimetype, size) VALUES ('${user_id}', '${fileName}', '${fname}','${lname}', '${req.body.utime}', '${req.body.ctime}','${req.body.description}', '${process.env.AWS_CLOUD_FRONT}${fileName}', '${mimeType}', ${fileSize})`;
    performDatabaseOperations(
      req,
      res,
      fileName,
      insert_query,
      "uploaded",
      user_id,
      fname,
      lname
    );
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
  const dynamic_query = isAdmin
    ? " ORDER BY ctime"
    : ` WHERE user_id = '${user_id}' ORDER BY ctime DESC`;
  // const read_query = `SELECT * FROM user_files WHERE user_id = '${req.query.user_id}'`;
  const read_query = `SELECT * FROM user_files${dynamic_query}`;
  performDatabaseOperations(
    req,
    res,
    "*",
    read_query,
    "read",
    user_id,
    fname,
    lname
  );
};

// update the exisitng file for the current user
exports.update_file = async function (req, res) {
  var oUserDetails = getUserDetails(res),
    user_id = oUserDetails.user_id;
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
    const update_query = `UPDATE user_files SET ctime = '${req.body.ctime}', description = '${req.body.description}' WHERE user_id = '${user_id}' AND filename = '${req.body.filename}'`;
    performDatabaseOperations(
      req,
      res,
      fileName,
      update_query,
      "updated",
      user_id,
      null,
      null
    );
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
    const delete_query = `DELETE FROM user_files WHERE user_id = '${user_id}' AND filename = '${fileName}'`;
    performDatabaseOperations(
      req,
      res,
      fileName,
      delete_query,
      "deleted",
      user_id,
      null,
      null
    );
  });
};
