const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const mime = require("mime/lite");
const bodyParser = require("body-parser");
const compression = require("compression");
const rimraf = require("rimraf");
const minify = require("express-minify");

app.use(compression());
app.use(minify());
app.use(express.static(path.join(__dirname, "../")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// START OS API

app.get("/packages", async function(req, res) {
  const array = [];
  const packages = fs
    .readdirSync(`${__dirname}/packages`, { withFileTypes: true })
    .filter(dir => dir.isDirectory());
  let canAccess;
  for (const dir of packages) {
    const info = require(`${__dirname}/packages/${dir.name}/info.json`);
    if (info.isApp) {
      canAccess = true;
      try {
        fs.accessSync(
          `${__dirname}/packages/${dir.name}/icon.webp`,
          fs.constants.F_OK
        );
      } catch (e) {
        canAccess = false;
      }
      if (canAccess) {
        const rawIcon = fs.readFileSync(
          `${__dirname}/packages/${dir.name}/icon.webp`
        );
        info.icon = await Buffer.from(rawIcon).toString("base64");
      }
    }
    array.push(info);
  }
  res.send(array);
});

// START FILE API
app.use(express.static('public'))
app.get("/file/read/:type/:filePath", async function(req, res) {
  if (req.params.type === "directory") {
    const array = [];
    fs.readdir(
      `${__dirname}/${req.params.filePath}`,
      { withFileTypes: true },
      function(e, rawDir) {
        for (const file of rawDir) {
          var type = mime.getType(file.name.split(".").pop());
          if (file.isDirectory() && !type) type = "directory";
          array.push({
            name: file.name,
            type: type,
            path: `${req.params.filePath}/${file.name}`
          });
        }
        res.send(array);
      }
    );
  } else if (req.params.type === "file") {
    fs.readFile(`${__dirname}/${req.params.filePath}`, (err, data) => {
      const file = Buffer.from(data).toString("base64");
      res.send(JSON.stringify(file));
    });
  }
});
app.get("/file/readStatic/:filePath", async function(req, res) {
  fs.readFile(`${__dirname}/${req.params.filePath}`, (err, data) => {
    res.writeHead(200);
    res.end(data);
  });
});
app.post("/file/write/:type/:filePath", async function(req, res) {
  if (!req.params.filePath.includes("home")) return;
  if (req.params.type === "directory") {
    fs.mkdir(`${__dirname}/${req.params.filePath}`);
  } else if (req.params.type === "file") {
    const file = Buffer.from(req.body.data, "base64").toString("ascii");
    fs.writeFile(
      `${__dirname}/${req.params.filePath}`,
      file,
      "ascii",
      function() {}
    );
  }
});
app.post("/file/rm/:type/:filePath", async function(req, res) {
  if (!req.params.filePath.includes("/home")) return;
  if (req.params.type === "directory") {
    rimraf(`${__dirname}/${req.params.filePath}`);
  } else if (req.params.type === "file") {
    fs.unlink(`${__dirname}/${req.params.filePath}`);
  }
});
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require('./../cors_anywhere/lib/rate-limit')("300 3");
require("./../cors_anywhere").createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: checkRateLimit,
    removeHeaders: [
    //'cookie',
    //'cookie2',
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-heroku-queue-wait-time',
    'x-heroku-queue-depth',
    'x-heroku-dynos-in-use',
    'x-request-start',
    "Referer",
    //"X-Forwarded-Host",
    "X-Forwarded-Host",
    "Host",
"Mod-Rewrite",
    "X-Forwarded-Port",
"X-Forwarded-Proto",
/*"Sec-Fetch-Site",
"Sec-Fetch-Site",
    "Sec-Fetch-Mode",
"Sec-Fetch-Dest",*/
    //"X-Accel-Internal",
"Sec-Fetch-Dest",
    "X-Accel-Internal",
    "X-Real-Ip",
    //"X-Forwarded-For",
    //"Traceparent"
    "X-Forwarded-For",
    "Traceparent"
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    xfwd: false,
  },
},app);
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  if(req.originalUrl.startsWith("/cors")){
    res.send("404 not found");
    return;
  }
  if(req.session.lasturl){
    res.redirect("/cors/"+req.session.lasturl+req.originalUrl);
  }
});
app.listen(port, () => console.log(`auroraOS started on port ${port}`));
