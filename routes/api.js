const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/news", (req, res) => {
  const newsFilePath = path.join(__dirname, "news.json");
  const newsData = JSON.parse(fs.readFileSync(newsFilePath, "utf-8"));

  const page = parseInt(req.query.page) || 1; // Get the page number from the query string, default to 1
  const limit = 2; // Number of news items to return per page (adjust as needed)
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Sort the news data in descending order based on the date field
  const sortedNewsData = newsData.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Return the paginated news items
  const paginatedNewsData = sortedNewsData.slice(startIndex, endIndex);

  res.json(paginatedNewsData);
});

module.exports = router;
