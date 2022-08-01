const bunyan = require("bunyan");
const path = require("path");
const { path: root } = require("app-root-path");

const logger = bunyan.createLogger({
  name: "MindNet",
  streams: [
    {
      level: "info",
      stream: process.stdout
    },
    {
      level: "warn",
      stream: process.stderr,
      path: path.resolve(root, "logs.json")
    },
    {
      level: "debug",
      stream: process.out,
      path: path.resolve(root, "logs.json")
    }
  ]
});

function logRequest(req, res, next) {
  logger.info("captured incoming request.\n" +
    "req.protocol: %o\n" +
    "req.method: %o\n" +
    "req.originalUrl: %o\n" +
    "req.query: %o\n" +
    "req.params: %o\n" +
    "req.cookies: %o\n" +
    "req.signedCookies %o\n" +
    "req.headers: %o\n" +
    "req.isAuthenticated: %o\n" +
    "req.body: %o\n",
    req.protocol,
    req.method,
    req.originalUrl,
    req.query,
    req.params,
    req.cookies,
    req.signedCookies,
    req.headers,
    req.isAuthenticated,
    req.body
  );
  next();
}

function logResponse(req, res, next) {
  logger.info("response", {
    // routerStack: res.app._router.stack,
    params: res.app._router.params,
    _params: res.app._router._params,
    headersSent: res.headersSent,
    locals: res.locals
  });
  next();
}

function logSession(msg) {
  return function(req, res, next) {
    const message = `req.session @ ${msg}\n`;

    logger.info(message, req.session);

    next();
  }
}

module.exports = {
  logger,
  logRequest,
  logResponse,
  logSession
}

