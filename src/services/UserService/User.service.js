const { logger: l } = require("@utils/logger.util");

var UserService = {};

UserService.getUserById = function(id) {
  l.info("fetching user record by userId = %s ...", id);

  if (id === 42) {
    const user = { id: 42, username: "Alice" };
    l.info("user record found.", user);

    return user;
  }
  else {
    l.info("user record not found.");
    return null;
  }
}

UserService.getUser = function(username, password) {
  l.info("fetching user record by username = %s password = %s ...", username, password);

  if (username === "alice" && password === "letmein") {
    const user = { id: 42, username: "Alice" };
    l.info("user record found.", user);

    return user;
  }
  else {
    l.info("user record not found.");
    return null;
  }
}

module.exports = UserService;

