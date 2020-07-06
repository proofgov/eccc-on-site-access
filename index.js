// Entry point
const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");

const app = express();

const listenPort = 4000;

currentDir = path.dirname(__filename);

const {
  loadProviderInfo,
  saveProviderInfo,
  loadSchema,
  requester,
  protocol,
  hostname,
  port,
} = require(path.resolve(currentDir, "utils/helpers"));

const DAYS = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
});

const HOURS = Object.freeze({
  NOON: 12,
});

// *************************
// Express Application Setup
// *************************

app.get("/", (req, res) =>
  res.send(
    "<h1>Welcome to the Example App for Proof Form Query API</h1>" +
      '<p>To read more on how to use this example app, visit <a href="https://github.com/proofgov/example-form-query-api">Proof\'s github form query api example page.</a>'
  )
);

// building name, floor, request date and request time as parameters.
//Have it return "blocked" if the request is noon or Tuesday, otherwise it says accept.
app.get("/available", (request, response) => {
  console.log("request", request.query);
  const {
    building,
    floor: queryFloor,
    date: queryDate,
    time: queryTime,
  } = request.query;
  const floor = Number(queryFloor);
  const date = new Date(queryDate);
  const time = new Date(`${queryDate} ${queryTime}`);

  const accessRequestedFor = new Date(`${queryDate} ${queryTime}`);

  console.log("building", building);
  console.log("floor", floor);
  console.log("date", date);
  console.log("time", time);
  console.log("accessRequestedFor", accessRequestedFor);

  if (
    accessRequestedFor.getDay() === DAYS.TUEDAY ||
    accessRequestedFor.getHours() === HOURS.NOON ||
    floor === 13
  ) {
    response.status(200);
    response.send("blocked");
    return;
  }

  response.status(200);
  response.send("allowed");
});

app.listen(listenPort, () =>
  console.log(`Example app listening at http://localhost:${listenPort}`)
);
