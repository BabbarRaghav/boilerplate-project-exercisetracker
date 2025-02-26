const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let UserData = [];
/**
 *
 * Object for user data must be like this:
 * _id: "60b5e7e8b6a4a9a7c1e2b6c"
 * username: "fcc_test_16"
 * log [{
 *   description: "test"
 *   duration: 60
 *   date: "Mon Jan 01 1990"
 * }]
 * __v: 1
 */

function makeid() {
  let length = 10;
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function SetUserData(req, res) {
  const username = req.body.username;
  const _id = makeid();
  let userData = {
    username: username,
    _id: _id,
    __v: 0,
  };
  UserData.push(userData);
  res.json(userData);
}

function GetUsersData(req, res) {
  let userData = [];
  UserData.forEach((user) => {
    userData.push({
      username: user.username,
      _id: user._id,
      __v: user.__v,
    });
  });
  res.json(userData);
}

app.route("/api/users").post(SetUserData).get(GetUsersData);

app.post("/api/users/:_id/exercises", (req, res) => {
  const _id = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  let indexToUpadte = UserData.findIndex((user) => user._id === _id);
  let userData = UserData.find((user) => user._id === _id);
  if (userData === undefined) {
    res.json({ error: "User not found" });
  } else {
    let exerciseData = {
      description: description,
      duration: parseInt(duration),
      date: date,
    };
    if (exerciseData.date === "") {
      exerciseData.date = new Date().toDateString();
    } else {
      let date = new Date(exerciseData.date)
      if (date.toString() === "Invalid Date") {
        res.json({ error: "Invalid Date" });
        return
      }
      exerciseData.date = new Date(exerciseData.date).toDateString();
    }
    if (userData.log === undefined) {
      userData.log = [];
    }
    userData.log.push(exerciseData);
    userData.__v = userData.__v + 1;
    UserData[indexToUpadte] = userData;

    let resultData = {
      _id: userData._id,
      username: userData.username,
      date: exerciseData.date,
      duration: exerciseData.duration,
      description: exerciseData.description,
    }
    res.json(resultData);
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  let userData = UserData.find((user) => user._id === _id);
  if (userData === undefined) {
    res.json({ error: "User not found" });
  } else {
    let log = userData.log;
    if (from) {
      log = log.filter((data) => data.date >= new Date(from));
    }
    if (to) {
      log = log.filter((data) => data.date <= new Date(to));
    }
    if (limit) {
      log = log.slice(0, limit);
    }
    userData.log = log;
    userData.count = log.length;
    res.json(userData);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
