const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(require("./joshua/joshua.routes"));
//app.use(require("./ivan/ivan.routes"));
// app.use(require("./erico/erico.routes"));
//app.use(require("./stephen/stephen.routes"));

app.listen(process.env.PORT || 3000, () => {
  console.log("server connected");
});
