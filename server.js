require("module-alias/register");

const app = require("./src/app");
const port = 1200;

app.listen(port, () => {
  console.log("server is listening to port %d", port);
});

