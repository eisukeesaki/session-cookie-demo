const path = require("path");
const express = require("express");
const session = require("express-session");
const redis = require("redis");
const connectRedis = require("connect-redis");
const { logger: l, logRequest, logSession } =
  require("@utils/logger.util");
const userService = require("./services/index");

const redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: "127.0.0.1",
    port: 6379
  }
});
const RedisStore = connectRedis(session);

redisClient.on("connect", () => {
  l.info("Redis client connected to server");
});
redisClient.on("error", (err) => {
  l.info("Redis error: ", err);
});

(async function initRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    l.info("Redis client failed to initiate connection to server", err);
  }
})();

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "SID",
  resave: false,
  saveUninitialized: true,
  secret: "1d3c951c-994d-416d-8b63-c1dd4437eb7b",
  unset: "keep",
  cookie: {
    expires: new Date("2022-08-31T16:59:59"),
    httpOnly: true,
    path: "/",
    sameSite: true,
    secure: false,
  },
  store: new RedisStore({
    host: "127.0.0.1",
    port: 6379,
    client: redisClient,
    ttl: 86400
  })
}));
app.use(logRequest);

/* send protected resource to client
check existence of session which has the same SID as the one received in Cookie header
if session exists
    try to find a user record in the db that matches the user id associated with the session
else
    redirect to /login
if the user record is found
    send requested(/protected) resource
else
    redirect to /login
*/
app.get("/",
  logSession("GET /"),
  (req, res) => {
    if (req.session) {
      const user = userService.getUserById(req.session && req.session.userId);
      if (!user)
        return res.redirect("/login");
    } else
      return res.redirect("/login");

    if (!req.session.pageViews)
      req.session.pageViews = 1;
    else
      req.session.pageViews++;

    req.write
    res.send(`Page views: ${req.session.pageViews}\nExpires: ${req.session.cookie._expires}`);
  }
);

// send login form
app.get("/login",
  logSession("GET /login"),
  (req, res) => {
    const p = path.resolve(__dirname, "views", "login.html");

    res.sendFile(p);
  }
);

/* authenticate user and generate new session
try to retrieve a user record in db that matches the credentials sent from client
if the user record is found
    associate current SID with user id
    redirect to /
else
    send user error status code
*/
app.post("/login",
  logSession("POST /login"),
  (req, res) => {
    const { username, password } = req.body;
    const user = userService.getUser(username, password);

    if (user && req.session)
      req.session.userId = user.id;
    else
      res.status(401).send("invalid username or password");

    res.redirect("/");
  }
);

module.exports = app;

