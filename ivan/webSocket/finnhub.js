const WebSocket = require("ws");
const { EventEmitter } = require("stream");

class FinnhubWS extends EventEmitter {
  constructor(api_key) {
    super();
    this.trackedsymbols = [];
    this.api_key = api_key;
    this.init();
  }

  parseData(data) {
    if (Object.keys(data).length === 0 || !data) {
      return null;
    }
    try {
      if (typeof data !== "object") {
        return JSON.parse(data);
      }
      return data;
    } catch (err) {
      return data;
    }
  }
  async init() {
    var self = this;
    const api_key = self.api_key;
    self.socket = new WebSocket(`wss://ws.finnhub.io?token=${api_key}`, {
      handshakeTimeout: 10000,
    });

    self.socket.on("open", () => {
      self.emit("onReady", true);
    });

    self.socket.on("error", (err) => {
      self.emit("onError", err);
      return;
    });

    self.socket.on("message", (data) => {
      let parsed = self.parseData(data.toString());
      if (!parsed) return;
      if (parsed.data) {
        const item = parsed.data[0];
        const symbol = item.s;

        const data = {
          price: item.p,
          date: new Date(item.t),
          symbol,
          volume: +item.v,
        };
        self.emit("onData", data);
      }
    });

    await self.waitForSocketConnection(self.socket);
  }

  waitForSocketConnection(socket, callback) {
    var self = this;
    setTimeout(function () {
      if (socket.readyState === 1) {
        console.log("Connection to finnhub established!");
        if (callback != null) {
          callback();
        }
      } else {
        self.waitForSocketConnection(socket, callback);
      }
    }, 5);
  }

  addBunchofStock(arr) {
    var self = this;
    self.trackedsymbols.push(arr);
    for (let i of arr) {
      self.addStock(i);
    }
  }

  addStock(stock) {
    var self = this;
    if (!self.socket) {
      console.log(`Socket not connected!`);
      return false;
    }
    try {
      const ada = self.trackedsymbols.includes(stock);
      if (ada) {
        return false;
      }
      self.trackedsymbols.push(stock);
      self.socket.send(JSON.stringify({ type: "subscribe", symbol: stock }));
      return true;
    } catch (err) {
      console.log(`error : ${err}`);
      return false;
    }
  }

  removeStock(stock) {
    var self = this;
    if (!self.socket) return false;
    try {
      const ada = self.trackedsymbols.includes(stock);
      if (ada) {
        self.trackedsymbols.push(stock);
        self.socket.send(
          JSON.stringify({ type: "unsubscribe", symbol: stock })
        );
        return true;
      }
    } catch (err) {
      console.log(`error : ${err}`);
      return false;
    }
  }
}

module.exports = FinnhubWS;
