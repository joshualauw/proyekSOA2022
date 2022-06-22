const dotenv = require("dotenv");
const path = require("path");
const FinnhubWS = require("./webSocket/finnhub");
const { default: axios, AxiosError } = require("axios");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const prisma = require("../helpers/db");
const emailTemplate = require("./alertemplate");

const {
  SIDE_BUY,
  TYPE_MARKET,
  TYPE_LIMIT,
  ALERT_ABOVE,
} = require("./utils");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

const typeStock = { Stock: "Common Stock", Crypto: "Crypto", Forex: "FX" };
const api_key_finnhub = process.env["APIKEY_FINNHUB"];
const api_key_mailgun = process.env["APIKEY_MAILGUN"];
const domain_mailgun = process.env["DOMAIN_MAILGUN"];
const api_key_currency = process.env["APIKEY_CURRENCYAPI"];

const finnhubWs = new FinnhubWS(api_key_finnhub);
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: api_key_mailgun,
  domain: domain_mailgun,
});

let trackingPrice = async () => {
  let tracking_data = await Promise.all(
    (
      await prisma.$queryRaw`SELECT symbol FROM alerts WHERE enable = 1 
      UNION
      SELECT symbol FROM orders WHERE fill_price = 0 `
    ).map(({ symbol }) => symbol)
  );

  finnhubWs.addBunchofStock(tracking_data);
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
    await prisma.orders.update({
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

const getStock = async (req, res) => {
  try {
    const { q } = req.params;
    let { currency, type } = req.query;

    let query = `https://finnhub.io/api/v1/search?q=${q}&token=${api_key_finnhub}`;
    let call = await axios.get(query);
    let { result } = call.data;
    if (type) {
      let filterType = typeStock[type];
      result = await Promise.all(
        result.filter((x) => x.type.includes(filterType))
      );
    }

    let currRate = 1;
    if (currency) {
      let listCurrency = `https://currencyapi.net/api/v1/rates?key=${api_key_currency}&output=JSON`;
      let { rates } = (await axios.get(listCurrency)).data;
      currRate = rates[currency];
    }
    let ctr = 0;
    let returnData = [];
    for (let item of result) {
      try {
        let { data } = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${api_key_finnhub}`
        );
        if (data && data.c != 0) {
          price = +currRate * +data.c;
          returnData.push({
            ...item,
            price,
            baseCurrency: currency || "USD",
          });
          ctr++;
          if (ctr == 5) break;
        }
      } catch (err) {
        continue;
      }
    }

    return res.status(200).send(returnData);
  } catch (e) {
    if (e instanceof AxiosError) {
      return res.status(500).send({ error: e.response.data });
    }
    return res.status(500).send({ error: "Internal server error!" });
  }
};

const sendEmail = async ({ email, note, symbol, price, type }) => {
  try {
    let exchange = symbol.split(":")[0].toLowerCase();
    let urlExchange = "https://" + exchange + ".com";
    mg.messages.create(domain_mailgun, {
      from: "Alert Man <mailgun@sandbox-123.mailgun.org>",
      to: [email],
      html: emailTemplate({ note, symbol, exchange, price, type, urlExchange }),
    });

    return true;
  } catch (e) {
    return false;
  }
};

const checkPriceAndAlertUser = async ({ symbol, price }) => {
  let notifs = await prisma.alerts.findMany({
    where: {
      symbol: symbol,
      enable: true,
    },
  });

  for (let i of notifs) {
    let isNotif = i.type == ALERT_ABOVE ? i.price < price : i.price > price;
    if (isNotif && (await sendEmail(i))) {
      await prisma.alerts.update({
        where: {
          alert_id: i.alert_id,
        },
        data: {
          enable: false,
        },
      });
    }
  }
};

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
  let size = orders.length;

  for (let i of orders) {
    if (i.buy && i.price >= price) {
      await fillOrder(i.order_id, price);
      size--;
      continue;
    }

    if (i.price <= price) {
      await fillOrder(i.order_id, price);
      size--;
    }
  }

  if (size == 0) {
    finnhubWs.removeStock(symbol);
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
  try {
    const { api_key } = req.user;
    const { side, type, symbol, exchange, qty, price } = req.data;

    let { error, data } = await checkSymbol(exchange, symbol);
    if (error) {
      return res.status(error.status).send({ msg: error.msg });
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

    order.type = order.type.toUpperCase();
    order.side = order.buy ? `BUY` : `SELL`;

    delete order.buy;
    delete order.api_key;

    return res
      .status(201)
      .json({ orderId: insertOrder.order_id, ...order, status: "NEW" });
  } catch (e) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

const getOrder = async (req, res) => {
  try {
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

    const orders = await Promise.all(
      (
        await prisma.orders.findMany({
          where: {
            AND: {
              ...criteria,
            },
          },
        })
      ).map(async ({ buy, cancel, type, ...rest }) => {
        let getPrice = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${rest.symbol}&token=${api_key_finnhub}`
        );
        let price = getPrice.data.c;
        let pnl = 0;
        let roe = 0;
        if (rest.fill_price != 0) {
          pnl = ((price - rest.fill_price) * rest.qty).toPrecision(5);
          roe =
            Math.floor(((price - rest.fill_price) / rest.fill_price) * 100) +
            "%";
        }
        return {
          ...rest,
          side: buy ? `BUY` : `SELL`,
          status: cancel ? `CANCELED` : `NEW`,
          type: type.toUpperCase(),
          pnl,
          roe,
        };
      })
    );

    return res.status(200).json(orders);
  } catch (e) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    let { id } = req.params;
    let checkOrder = await prisma.orders.findUnique({
      where: {
        order_id: Number(id),
      },
    });

    if (checkOrder.fill_price != 0) {
      return res.status(400).send({ msg: "Order sudah tereksekusi!" });
    }

    if (checkOrder.cancel == true) {
      return res.status(400).send({ msg: "Order sudah dicancel!" });
    }

    const result = await prisma.orders.update({
      where: {
        order_id: Number(id),
      },
      data: {
        cancel: true,
      },
    });

    return res.status(200).send({ ...result, status: "CANCELED" });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2015") {
        return res.status(404).send({ msg: "Order tidak ditemukan!" });
      }
    }
    return res.status(500).send({ error: "Internal server error!" });
  }
};

const updateNotification = async (req, res) => {
  try {
    let { id } = req.params;
    const { symbol, type, price, email, exchange, note } = req.data;
    let data_lama = await prisma.alerts.findUnique({
      where: {
        alert_id: id,
      },
    });
    if (!data_lama) {
      return res.status(404).send({ msg: "Alert tidak ditemukan" });
    }
    if (!email) {
      email = req.user.email;
    }
    let { error, data } = await checkSymbol(exchange, symbol);
    if (error) {
      return res.status(error.status).send(error.msg);
    }
    let newSymbol = data.symbol;
    data_lama = (({ alert_id, enable, ...rest }) => ({ ...rest }))(data_lama);
    finnhubWs.addStock(newSymbol);
    let updatedNotif = {
      type,
      price,
      email,
      symbol: newSymbol,
      api_key,
      note,
    };
    let data_baru = {};
    for (var p in updatedNotif) {
      if (data_lama[p] != updatedNotif[p]) {
        data_baru[p] = updatedNotif[p];
      }
    }
    if (data_baru) {
      await prisma.alerts.update({
        where: {
          alert_id: id,
        },
        data: updatedNotif,
      });
      return res.status(200).send({ data_lama, data_baru });
    } else {
      return res.status(200).send({ data_lama, data_baru });
    }
  } catch (e) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

const getPriceNotification = async (req, res) => {};

const setPriceNotification = async (req, res) => {
  try {
    const { symbol, type, price, email, exchange, note } = req.data;
    const { api_key } = req.user;

    if (!email) {
      email = req.user.email;
    }

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
      symbol: newSymbol,
      api_key,
      note,
    };

    await prisma.alerts.create({ data: alert });

    return res.status(200).send(alert);
  } catch (e) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrder,
  setPriceNotification,
  updateNotification,
  getPriceNotification,
  getStock,
};
