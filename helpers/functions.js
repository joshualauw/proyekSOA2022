const db = require("./db");

async function checkToken(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  try {
    let user = await db.users.findFirst({
      where: {
        api_key: token,
      },
    });
    if (!user) {
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

const permitPremiumUser = 
  (req, res, next) => {
    if(req.user.tipe_user != "premium"){
      return res.status(403).send({message: `Hanya user premium yang boleh mengakses endpoint ini!`})
    }
    next()
  }


function genRandomId(length) {
  let result = "";
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

module.exports = {
  checkToken,
  genRandomId,
  nFormatter,
  permitPremiumUser
};
