const dotenv = require("dotenv");
const path = require("path");
const events = require("events");
const FinnhubWS = require("./webSocket/finnhub");
const { default: axios } = require("axios");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const prisma = require("../helpers/db");

const {
  SIDE_BUY,
  SIDE_SELL,
  TYPE_MARKET,
  TYPE_LIMIT,
  ALERT_ABOVE,
  ALERT_BELOW,
} = require("./utils");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const api_key_finnhub = process.env["APIKEY_FINNHUB"];
const api_key_mailgun = process.env["APIKEY_MAILGUN"];

const finnhubWs = new FinnhubWS(api_key_finnhub);
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key: api_key_mailgun });

// let dataHistory = []

let trackingPrice = async () => {
  let data = (
    await prisma.orders.groupBy({
      by: ["symbol"],
      where: {
        fill_price: {
          not: 0
        }
      }
    })
  ).map(({ symbol }) => symbol );

  finnhubWs.addBunchofStock(data);
};


finnhubWs.on("onReady", async (data) => {
  trackingPrice();
});

finnhubWs.on("onData", async (data) => {
  await checkAndExecuteOrder(data);
  await checkPriceAndAlertUser(data);
  //console.log(data)
});

const fillOrder = async (id, fillPrice) => {
  try {
    const result = await prisma.orders.update({
      where: {
        order_id: id,
      },
      data: {
        fill_price: fillPrice,
      },
    });
    console.log(`Order with Id ${id} filled!`);
  } catch (e) {
    console.log(e);
  }
};

const checkPriceAndAlertUser = async ({ symbol, price }) => {
  let notifs = await prisma.notifications.findMany({
    where: {
      symbol: symbol,
    },
  })

  for(let i of notifs){
    let isNotif = (i.type == ALERT_ABOVE) ? i.price <= price : i.price >= price; 
    
  }
}

const checkAndExecuteOrder = async ({ symbol, price }) => {
  let orders = await prisma.orders.findMany({
    where: {
      AND: {
        symbol: symbol,
        type: TYPE_LIMIT,
        fill_price: 0,
        NOT: {
          cancel: true,
        },
      },
    },
  });
  let size = orders.length

  for (let i of orders) {
    if (i.buy) {
      if (i.price >= price) {
        await fillOrder(i.order_id, price);
        size--
      }
      continue;
    }

    if (i.price <= price) {
      await fillOrder(i.order_id, price);
      size--
    }
  }

  if(size == 0){
    finnhubWs.removeStock(symbol)
  }  

};

const checkSymbol = async (exchange, symbol) => {
  let query = `https://finnhub.io/api/v1/crypto/symbol?exchange=${exchange}&token=${api_key_finnhub}`;
  let call = await axios.get(query);
  let data = call.data;
  if (data.length <= 0) {
    return {
      error: { msg: `Exchange tidak ditemukan!`, status: 401 },
      data: null,
    };
  }
  let sym = await Promise.all(data.filter((x) => x.symbol.includes(symbol)));
  return sym.length == 1
    ? { data: sym[0] }
    : sym.length > 1
    ? { error: { msg: `Symbol harus spesifik!`, status: 400 }, data: null }
    : { error: { msg: `Symbol tidak ditemukan!`, status: 401 }, data: null };
};

const createOrder = async (req, res) => {
  const { api_key } = req.user;
  const { side, type, symbol, exchange, qty, price } = req.data;

  let { error, data } = await checkSymbol(exchange, symbol);
  if (error) {
    return res.status(error.status).send(error.msg);
  }

  let newSymbol = data.symbol;

  if (type === TYPE_LIMIT) {
    finnhubWs.addStock(newSymbol);
  } else if (type === TYPE_MARKET) {
    let getPrice = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${newSymbol}&token=${api_key_finnhub}`
    );
    price = getPrice.data.c;
  }

  let buy = side == SIDE_BUY;

  let order = {
    symbol: newSymbol,
    price,
    qty,
    type,
    buy,
    api_key,
  };

  let insertOrder = await prisma.orders.create({ data: order });

  order.type = order.type.split("_")[1];
  order.side = order.buy ? `BUY` : `SELL`;
  delete order.buy;

  return res.status(201).json({ id: insertOrder.order_id, ...order });
};

const getOrder = async (req, res) => {
  let { id } = req.params;
  let user = req.user;
  let { symbol, type } = req.query;

  let criteria = Object.assign(
    {},
    symbol == null
      ? null
      : {
          symbol: {
            contains: symbol,
          },
        },
    type == null ? null : { type },
    id == null ? null : { order_id: Number(id) }
  );

  criteria.api_key = user.api_key;

  const orders = await prisma.orders.findMany({
    where: {
      AND: {
        ...criteria,
      },
    },
  });

  return res.status(200).json(orders);
};

const setPriceNotification = async (req, res) => {
  const { symbol, type, price, email, exchange } = req.data;
  const { api_key } = req.user;

  let { error, data } = await checkSymbol(exchange, symbol);
  if (error) {
    return res.status(error.status).send(error.msg);
  }

  let newSymbol = data.symbol;

  finnhubWs.addStock(newSymbol);
  
  let alert = {
    type,
    price,
    email,
    newSymbol,
    api_key,
  };

  let insertNotification = await prisma.notifications.create({ data: alert });

};

const cancelOrder = async (req, res) => {
  let { id } = req.params;
  let checkOrder = await prisma.orders.findUnique({
    where: {
      order_id: Number(id),
    },
  });
  console.log(checkOrder);
  if (checkOrder.fill_price != 0) {
    return res.status(400).send({ msg: "Order sudah tereksekusi!" });
  }

  if (checkOrder.cancel == true) {
    return res.status(400).send({ msg: "Order sudah dicancel!" });
  }

  try {
    const result = await prisma.orders.update({
      where: {
        order_id: Number(id),
      },
      data: {
        cancel: true,
      },
    });

    return res.status(200).send(result);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2015") {
        return res.status(404).send({ msg: "Order tidak ditemukan!" });
      }
    }
    console.log(e);
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrder,
  setPriceNotification,
};
