const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "048e839d5058a82354581784c3cc9ca91973f529820d4a3c673fd360393daf49b6ceeb6d8b76a1af49a34c4ebd47dccecb9fac61321752517a8de9dacec61990e7": 100,
  "04a4956e6c1fd580fda6ed8bc2f68a35d43c4f34ad9e9bca0804be95dfe46035b1a0933872c8a4498dd0c5c0003dccf0a5a05ee0eaeb450822010f5a21d8015622": 50,
  "047483f5ee32b1dbbfa9d3eea64a9b9890325991b66a42e66fceefd90f26752790d6d350755ca554ef69f2a46316f755320a07859ddbf12a07a044a0f13d1720ea": 75,
};

const privateKeyExampleGenerated = {
  "b18f63ce81b6b60ba522d4799c3bea5b330c9a56b2db241dde6cf21728aebdf0":1,
  "eed7fcf1a05305ac8d297f778bd32d14a0f3b727330a3cf3741fc964ed9df1ca":2,
  "e14e82215c9c99c507f28ebf6005fa7010a417d7d79e801adcb5e32fc49848a1":3,
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO get a signature from the client-side application
  // recover the public address from the signature

  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
