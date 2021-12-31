require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.use(express.json());

const users = [
  {
    username: "Carlos",
    password: "$2b$10$OojlzgsE/X5HUfPAGdXxr.dXD6AOGG9BinfPiSmwf7x3aSCs.1Ebm",
    title: "webDev",
    address: "Rio",
  },
  {
    username: "Manoe",
    password: "$2b$10$mc/uBFe9rA4bMtUE25nMx.3XxeWtojBI.p4cAw4AjqR4Un6qxiM4i",
    title: "DevOps",
    address: "Brussels",
  },
  {
    username: "Mamadou",
    password: "$2b$10$2JFraZIhP7KODVCfAaeCC.hRpL6P0X2xDtBJ3i1Y2asmkq/dDxrXi",
    title: "Network Enge",
    address: "Legos",
  },
  {
    username: "Wuange",
    password: "$2b$10$kX.G0lDGEjx4/LRkBaeKg.cKHXQ9A1efY5XRr4xClsH/dnZHMdBxm",
    title: "AI",
    address: "Shangahai",
  },
];

//refreshToken storage array
let refreshTokens = [];

//rereshToken genrating and verification
app.post("/retoken", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, userName) => {
      if (err) return res.sendStatus(403);
      const accessToken = createToken({name: userName.username});
      res.json({accessToken: accessToken});
    }
  );
});

//login
app.post("/login", async (req, res) => {
  const userName = {name: req.body.username};

  const user = users.find((user) => user.username == req.body.username);
  if (user == null) {
    return res.status(400).send("User doesn't Exist");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = createToken(userName);
      const refreshToken = jwt.sign(userName, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken);

      res.send({accessToken: accessToken, refreshToken: refreshToken});
      console.log("Login Success");
    } else {
      res.send("Not allowed");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//token generator
const createToken = (userName) => {
  return jwt.sign(userName, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "50s",
  });
};

//logout
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
  console.log("log-out Success!");
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

//register a user
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      username: req.body.username,
      password: hashedPassword,
    };
    users.push(user);
    res
      .status(201)
      .send(`${user.username} ${user.password}: Created successfully!`);
  } catch {
    res.status(500).send();
  }
});

//get allUsers route
app.get("/users", authenticateToken, (req, res) => {
  res.json(users);
});

app.listen(9000, () => {
  console.log("listening on: http://localhost:9000");
});
