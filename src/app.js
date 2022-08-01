const { logger: l, logRequest, logSession } =
  require("@utils/logger.util");
const express = require("express"),
  app = express();
const session = require("express-session");
const path = require("path");
const userService = require("./services/index");

const sessionOpts = {
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
  }
}

app.use(express.urlencoded({ extended: false }));
app.use(session(sessionOpts));
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

    req.session.nVisits++;
    res.send(`Yout have visited ${req.session.nVisits} times.\nIf you are seeing this you are authenticated and have a valid session`);
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

    if (user && req.session) {
      req.session.userId = user.id;
      req.session.nVisits = 0;
    }
    else
      res.status(401).send("invalid username or password");

    res.redirect("/");
  }
);

module.exports = app;

