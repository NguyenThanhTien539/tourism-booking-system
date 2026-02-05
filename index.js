const express = require("express");
const app = express();
const port = 7000;
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const databaseConfig = require("./config/database.config");
const clientRoutes = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");
const variableConfig = require("./config/variable.config");
databaseConfig.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

//tạo biến toàn cục cho file PUG
app.locals.pathAdmin = variableConfig.pathAdmin;

//tạo biến toàn cục cho file bên BE
global.pathAdmin = variableConfig.pathAdmin;

app.use(cookieParser());

app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`The programming is running at port ${port}`);
});
