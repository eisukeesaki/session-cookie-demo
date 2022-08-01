const { logger: l } = require("@utils/logger.util");

var UserService = {};

UserService.getUserById = function(id) {
  l.info("fetching user record by userId = %s ...", id);

  if (id === 2) {
    const user = { id: 2, username: "asuka" };
    l.info("user record found.", user);

    return user;
  } else if (id === 0) {
    const user = { id: 0, username: "rei" };
    l.info("user record found.", user);

    return user;
  } else {
    l.info("user record not found.");
    return null;
  }
}

UserService.getUser = function(username, password) {
  l.info("fetching user record by username = %s password = %s ...", username, password);

  if (username === "asuka" && password === "letasukain") {
    const user = { id: 2, username: "asuka" };
    l.info("user record found.", user);

    return user;
  } else if (username === "rei" && password === "letreiin") {
    const user = { id: 0, username: "rei" };
    l.info("user record found.", user);

    return user;
  } else {
    l.info("user record not found.");
    return null;
  }
}

module.exports = UserService;

