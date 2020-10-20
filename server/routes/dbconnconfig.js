var mysql = require("mysql");
var connection = mysql.createConnection({
  host: process.env.AWS_RDS_ENDPOINT,
  user: process.env.AWS_RDS_USERNAME,
  password: process.env.AWS_RDS_PASSWORD,
  port: process.env.AWS_RDS_PORT,
  database: process.env.AWS_RDS_DATABASE,
});
// connection.connect(function (err) {
//   if (err) {
//     console.error("Database connection failed: " + err.stack);
//     return;
//   }
//   console.log("Connected to database.");
// });
// connection.end();
// exports.api_route = async function (req, res) {};
module.exports = connection;
