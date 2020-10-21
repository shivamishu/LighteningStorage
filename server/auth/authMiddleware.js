var request = require("request");
var AWS = require("aws-sdk");
const CognitoExpress = require("cognito-express");
const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION,
  cognitoUserPoolId: process.env.AWS_POOL_ID,
  tokenUse: "access", //Possible Values: access | id
  tokenExpiration: 3600, //Up to default expiration of 1 hour (3600000 ms)
});
exports.Validate = function (req, res, next) {
  var token = req.headers["authorization"];
  token = token.split("Bearer ")[1];

  // cognitoExpress.validate(token, function (err, response) {
  //   if (err) {
  //     res.sendStatus(401);
  //   } else {
  //     //authenticated;
  //     next();
  //   }
  // });
  var params = {
    AccessToken: token,
  };
  var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
  try {
    cognitoIdentityServiceProvider.getUser(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(401);
      } // an error occurred
      else {
        // console.log(data);
        res.locals.user = data; //could be used in api_routes
        next();
      }
    });
  } catch (err) {
    res.sendStatus(401);
  }
};
