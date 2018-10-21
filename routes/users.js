var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //GET the request elements
  var queryParams = req.query;

  var browser = queryParams['browser'];
  var low = queryParams['low'];
  var high = queryParams['high'];

  //Use the 'let' keyword because we don't want the variable to be global in scope.
  let db = new sqlite3.Database('./db/testing.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to database for pitch variance test.");
    }
  });

  //Create the test table if it doesn't exist
  db.run("CREATE TABLE IF NOT EXISTS pitchTest (id INTEGER PRIMARY KEY AUTOINCREMENT, browser VARCHAR(50), low INTEGER, high INTEGER);", {}, function() {

      //Insert the values into the database
      db.run("INSERT INTO pitchTest(browser, low, high) VALUES(?, ?, ?)", browser, low, high);

      //Run a select query
      let sql = 'SELECT browser, AVG(low) as lowAvg, AVG(high) as highAvg FROM pitchTest GROUP BY browser;';

      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        //For now, we're just debugging whether the insert worked or not, the callback indicates a load success
        res.render('users', { rowData : rows});
      });
  });

});

module.exports = router;
