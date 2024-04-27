const express = require('express');
const { Pool } = require('pg');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

// Loading environment variables from a .env file
require('dotenv').config();

// Creating an Express app instance
const app = express();

// Default port or environment specific port
const port = process.env.PORT || 3050;

// Configuration for PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'DB_NAME',
  password: process.env.DB_PASSWORD || 'DB_PASSWORD',
  port: process.env.DB_PORT || 5433,
});

// Middleware to enable CORS (Cross-Origin Resource Sharing)
const cors = require('cors');
app.use(cors());

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
}
app.use(errorHandler);

// Function to retrieve entries from the current date and go back up to 364 days if necessary
async function getEntriesForCurrentDate() {
  let currentDate = moment().format('DD-MM');
  for (let i = 0; i < 365; i++) {
    const result = await pool.query('SELECT * FROM data WHERE day_month = $1 ORDER BY year ASC', [currentDate]);
    if (result.rows.length > 0) {
      return result.rows;
    } else {
      currentDate = moment(currentDate, 'DD-MM').subtract(1, 'days').format('DD-MM');
    }
  }
  return [];
}

// Endpoint to get entries for the current date
app.get('/', async (req, res) => {
  const entries = await getEntriesForCurrentDate();
  if (entries.length > 0) {
    res.json(entries);
  } else {
    res.json({ message: 'No entries found for today or the past year.' });
  }
});

// Endpoint to fetch articles by a specific tag
app.get('/articles-by-tag', async (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    return res.status(400).send('Tag is required');
  }

  try {
    const result = await pool.query('SELECT * FROM data WHERE words LIKE $1 ORDER BY date ASC', [`%${tag}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint for search functionality based on user input
app.get('/search', async (req, res) => {
  const userInput = req.query.q;
  if (!userInput) {
    return res.status(400).send('Bad Request: Please provide a search query.');
  }
  const result = await pool.query('SELECT * FROM data WHERE content ILIKE $1 ORDER BY date ASC', [`%${userInput}%`]);
  if (result.rows.length > 0) {
    res.json(result.rows);
  } else {
    res.json({ message: 'No matching entries found.' });
  }
});

// Endpoint to get detailed information of a single entry by ID
app.get('/entry', async (req, res) => {
  const entryId = req.query.id;
  if (!entryId) {
    res.status(400).send('ID is required');
    return;
  }
  const result = await pool.query('SELECT * FROM data WHERE id = $1', [entryId]);
  if (result.rows.length > 0) {
    const entry = result.rows[0];
    const rawContent = entry.content;
    const formattedContent = rawContent.replace(/\n/g, '<br>');
    const logoPath = path.join(__dirname, '/Logo.png'); 
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const styleSection = `
      <style>
        .title-font {
          font-family: 'Times New Roman'; /* Example: Change the font-family as needed */
      </style>
    `;

    // HTML structure for navigation bar and content
    const navbarHtml = `
    <table width="100%" style="height: 150px; padding: 0px; ">
      <tr>
        <td style="text-align: left; width: 27%;">
          <img src="data:image/png;base64,${logoBase64}" alt="Logo" style="height: 150px;" />
        </td>
        <td style="text-align: left; width: 73%;">
          <div style="text-align: left; display: inline-block; max-width: 90%; margin-left: 5%;">
            <h1 class="title-font" style="margin: 0;">HISTORICAL NEWS</h1>
            <h3 class="title-font" style="margin: 0;">A PLACE WHERE THE PAST COMES ALIVE</h3>
          </div>
        </td>
      </tr>
    </table>
  `;

  const articleHeading = `<h2 class="title-font" style="background-color: #f0f0f0; padding: 16px; margin: 0px">In ${entry.year} on the ${entry.day_month} in ${entry.place}, this newspaper was published:</h2>`;

    // Sending HTML with the static navbar and the entry content
    res.send(`<!DOCTYPE html>
      <html>
      <head>
        <title>Historical News Entry</title>
        ${styleSection}
      </head>
      <body>
        ${navbarHtml}
        ${articleHeading}
        <div style="margin-top: 20px;">
          ${formattedContent}
        </div>
      </body>
      </html>
    `);
  } else {
    res.send('Entry not found.');
  }
});

// Endpoint to get article counts by month and optional year range
app.get('/monthly', async (req, res) => {
  const { yearFrom, yearTo } = req.query;
  try {
    let query = 'SELECT month, COUNT(*) AS article_count FROM data';
    let conditions = [];
    let params = [];
    if (yearFrom) {
      conditions.push('year >= $1');
      params.push(yearFrom);
    }
    if (yearTo) {
      conditions.push('year <= $' + (params.length + 1));
      params.push(yearTo);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' GROUP BY month ORDER BY month ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get articles by specific month and optional year range
app.get('/articles', async (req, res) => {
  const { month, yearFrom, yearTo } = req.query;
  let query = `SELECT * FROM data WHERE EXTRACT(MONTH FROM date) = $1`;
  let queryParams = [month];
  if (yearFrom) {
    query += ` AND year >= $2`;
    queryParams.push(yearFrom);
  }
  if (yearTo) {
    query += ` AND year <= $3`;
    queryParams.push(yearTo);
  }
  query += " ORDER BY date ASC";
  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles by month and year range:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get article counts by year
app.get('/yearly', async (req, res) => {
  try {
    const result = await pool.query('SELECT year, COUNT(*) AS article_count FROM data GROUP BY year ORDER BY year ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching yearly data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to get geographic data for articles to display on a map
app.get('/map-data', async (req, res) => {
  try {
    const query = 'SELECT place_corrected, latitude, longitude FROM data'; 
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch articles by city, filtering based on the city provided in the query
app.get('/articles-by-city', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).send('City is required');
  }
  try {
    const result = await pool.query('SELECT * FROM data WHERE place_corrected LIKE $1 ORDER BY date ASC', [`%${city}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles by city:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server and listen on the configured port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Global error handler for uncaught promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
