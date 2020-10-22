"use strict";
var AWS = require("aws-sdk");
let awsConfig = {
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
//Read files
module.exports.readFiles = async function (req, res, user_input) {
  const input = {
    user_id: user_input.user_id,
  };
  const isAdmin = user_input.user_id === process.env.ADMIN ? true : false;
  var params;
  if (isAdmin) {
    params = {
      TableName: "userfiles",
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        // console.log(data.Items);
        res.send({
          items: data.Items,
          name: user_input.fname + " " + user_input.lname,
          user_id: user_input.user_id,
          mode: "ADMIN",
        });
      }
    });
  } else {
    params = {
      TableName: "userfiles",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_input.user_id,
      },
    };

    docClient.query(params, async function (err, data) {
      if (err || !data.Items) {
        console.log(err);
        res.send(err);
      } else {
        // console.log(data.Items);
        res.send({
          items: data.Items,
          name: user_input.fname + " " + user_input.lname,
          user_id: user_input.user_id,
          mode: "USER",
        });
      }
    });
  }
};
//Upload Files
module.exports.uploadFile = async function (req, res, user_input) {
  var params = {
    TableName: "userfiles",
    Item: user_input,
  };
  docClient.put(params, function (err, data) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      // console.log(data.Items);
      res.status(200).send(user_input);
    }
  });
};

//Update Files
module.exports.updateFile = async function (req, res, user_input) {
  var params = {
    TableName: "userfiles",
    Key: { user_id: user_input.user_id, filename: user_input.filename },
    UpdateExpression: "set ctime = :ct, description = :desc, size =  :sz",
    ExpressionAttributeValues: {
      ":ct": user_input.ctime,
      ":desc": user_input.description,
      ":sz": user_input.size,
    },
    ReturnValues: "UPDATED_NEW",
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      // console.log(data.Items);
      res.status(200).send(user_input);
    }
  });
};

module.exports.deleteFile = async function (req, res, user_input) {
  var params = {
    TableName: "userfiles",
    Key: { user_id: user_input.user_id, filename: user_input.filename },
  };
  docClient.delete(params, function (err, data) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.status(200).json({
        message: "Delete Successfully",
      });
    }
  });
};
