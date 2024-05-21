const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');
const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));

// Configure MySQL connection parameters
const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'Talash',
});

// Connect to MySQL with error handling
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database Talash');
});

// Function to fetch a clue by pincode
//const getClueByPincode = (pincode, callback) => {
//  const query = 'SELECT clue, team_name FROM TreasureTeams WHERE pin_code = ?';
//  db.query(query, [pincode], (err, results) => {
//    if (err) {
//      callback(err, null);
//    } else {
//      callback(null, results);
//    }
//  });
//};

//new query to get room id as well
const getClueByPincode = (pincode, callback) => {
  const query = 'SELECT rf.room_id, tt.team_name, tt.clue FROM RoomFinder rf JOIN TreasureTeams tt ON rf.treasure_id = tt.treasure_id AND rf.team_id = tt.team_id WHERE tt.pin_code = ?';
  db.query(query, [pincode], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};



// HTTP endpoint to fetch a clue by pincode
app.get('/clue', (req, res) => {
  const pincode = parseInt(req.query.pincode, 10);

  if (isNaN(pincode)) {
    res.status(400).send('Invalid pincode format');
    return;
  }

  getClueByPincode(pincode, (err, results) => {
    if (err) {
      res.status(500).send(`Error fetching clue for pincode ${pincode}: ${err.message}`);
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send(`Clue not found for pincode ${pincode}`);
      }
    }
  });
});

// Endpoint to return a static URL
app.get('/generate', (req, res) => {
  res.json({ url: '/page' });
});

// Route to serve a specific page
app.get('/page', (req, res) => {
  // Adjust the path to your actual template file if different
  res.sendFile(path.join(__dirname, 'public', 'template.html'));
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the Express server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
