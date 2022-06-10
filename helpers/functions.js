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

function genRandomId(length) {
  let result = "";
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

module.exports = {
  checkToken,
  genRandomId,
};
