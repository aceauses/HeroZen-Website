require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs"); // For reading certificate files
const http = require("http"); // HTTP server
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const licenseRoutes = require("./routes/license");
const appRoutes = require("./routes/application");
const appAuthjwt  = require("./routes/authjwt");
const apiRoutes = require("./routes/api");
const { authenticateToken } = require("./routes/authjwt");
// const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || 443;
const httpPort = 80; // Standard HTTP port

// SSL/TLS Configuration
const httpsOptions = {
  key: fs.readFileSync("./certs/private.key.pem"),
  cert: fs.readFileSync("./certs/domain.cert.pem"),
  ca: fs.readFileSync("./certs/intermediate.cert.pem"),
};


const path = require("path");
app.use(bodyParser.json()); // Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); 


// Mount routes
app.use("/auth", authRoutes);
app.use("/license", licenseRoutes);
app.use("/app", appRoutes);
app.use("/secure", appAuthjwt);
app.use("/api", apiRoutes);
// app.use("/user", userRoutes);


// Default route it will display a hello message
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index/index.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register/register.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login/login.html");
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.sendFile(__dirname + "/public/dashboard/app.html");
});
// ... Error handling middleware (if needed) ...

// // Redirect HTTP to HTTPS (Optional)
http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url,
    });
    res.end();
  })
  .listen(httpPort, () => {
    console.log(
      `HTTP server listening on port ${httpPort} (Redirecting to HTTPS)`
    );
  });

// Create HTTPS Server
const httpsServer = require("https").createServer(httpsOptions, app);

httpsServer.listen(port, () => {
  console.log(`HTTPS server listening on port ${port}`);
});
