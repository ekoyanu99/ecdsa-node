const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const balances = {
  "048e839d5058a82354581784c3cc9ca91973f529820d4a3c673fd360393daf49b6ceeb6d8b76a1af49a34c4ebd47dccecb9fac61321752517a8de9dacec61990e7": 100,
  "04a4956e6c1fd580fda6ed8bc2f68a35d43c4f34ad9e9bca0804be95dfe46035b1a0933872c8a4498dd0c5c0003dccf0a5a05ee0eaeb450822010f5a21d8015622": 50,
  "047483f5ee32b1dbbfa9d3eea64a9b9890325991b66a42e66fceefd90f26752790d6d350755ca554ef69f2a46316f755320a07859ddbf12a07a044a0f13d1720ea": 75,
  "04998ae372910fc521d550686ef75d5f42d39ecb62de9fd9e4fd0f698200f0708396ebf7be0a34ff732e9f4c16face281d103d5c8ceed636bcd8474a45e015195b": 999,
  "048fb26ce7bed0f03db41c9a824880656b25550050dd868284e0b47beb1432473f49a2685e74f5646ac99171f4b269a8f73921757f0b8f6055ad5a7f1015370031": 888,
  "042e8fe7d73e21b4083ce1953e26644a9046f303604f048fa422e4d336d18d654ea4e4a969f168637c589b4a5a363da7890d682fd9a68ab7b3e2b8bd7a9502d5d2": 777,
};

const privateKeyExampleGenerated = {
  "b18f63ce81b6b60ba522d4799c3bea5b330c9a56b2db241dde6cf21728aebdf0": 1,
  "eed7fcf1a05305ac8d297f778bd32d14a0f3b727330a3cf3741fc964ed9df1ca": 2,
  "e14e82215c9c99c507f28ebf6005fa7010a417d7d79e801adcb5e32fc49848a1": 3,
  "d08172b61f9d8d293da60e90cec5b722ff393b8b05348fc83509c56766d34049": 4,
  "e9174d63ef999e697c02a2ffa8f451592a5d3b089cabc9823cd738054d85c553": 5,
  "6a59ac2743cc7a7ba14f7d634e1b3139e6870dfd24328b71e86f8c1f29a562cf": 6,
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send2", async (req, res) => {
  // TODO get a signature from the client-side application
  // recover the public address from the signature

  const { signature, msgHash, sender } = req.body;
  console.log("signature:", signature)
  console.log("msgHash:", msgHash)
  console.log("sender:", sender)

  const isValidSignature = await secp.verify(
    signature,
    msgHash,
    sender);

  console.log("isValid", isValidSignature);
  res.send({
    _s: signature,
    _m: msgHash,
    _a: sender
  });

});

app.post("/send", async (req, res) => {

  const { signature, ...message } = req.body;
  const { sender, recipient, sendAmount } = message;
  const msgHash = keccak256(utf8ToBytes(JSON.stringify(message)));
  console.log("signature:", Object.values(signature).toString())
  console.log("msgHash:", msgHash)
  console.log("sender:", sender)

  const isValidSignature = await secp.verify(
    Object.values(signature).toString(),
    msgHash.toString(),
    sender);

  console.log("isValid", isValidSignature);
  if (!isValidSignature) {
    res.status(400).send({ message: "invalid signature" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < sendAmount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= sendAmount;
    balances[recipient] += sendAmount;
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
