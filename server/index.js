const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*'  // allows all origins for now
}));
app.use(express.json());

const db = mysql.createConnection({
  host: 'yamabiko.proxy.rlwy.net',
  port: 27744,
  user: 'root',
  password: 'CDbNkIMJZzCUiQqJwLlSQjKHYsdfUHVX',
  database: 'railway'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to Railway MySQL!');
});

app.delete('/api/expenses/clear', (req, res) => {
  db.query('TRUNCATE TABLE expenses', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to clear expenses table' });
    res.json({ message: 'Expenses table cleared successfully' });
  });
});

app.get('/api/expenses', (req, res) => {
  db.query(
    'DELETE FROM expenses WHERE created_at < NOW() - INTERVAL 30 MINUTE',
    (err) => {
      if (err) console.error('Auto-clear error:', err);
      db.query('SELECT * FROM expenses', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
      });
    }
  );
});

const clearOldExpenses = () => {
  db.query(
    'DELETE FROM expenses WHERE created_at < NOW() - INTERVAL 30 MINUTE',
    (err) => {
      if (err) console.error('Auto-clear error:', err);
      else console.log('Old expenses cleared');
    }
  );
};

// Run every 30 minutes
setInterval(clearOldExpenses, 30 * 60 * 1000);

app.post('/api/expenses', (req, res) => {
  const { name, amount, date, notes } = req.body;
  if (!name || !amount || !date || !notes) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.query(
    'INSERT INTO expenses (name, amount, date, notes) VALUES (?, ?, ?, ?)',
    [name, amount, date, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Expense added', id: result.insertId });
    }
  );
});

app.listen(8080, () => console.log('Server running on port 8080'));