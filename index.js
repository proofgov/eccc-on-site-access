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
  "1": "8:00 am",
  "2": "9:00 am",
  "3": "10:00 am",
  "4": "11:00 am",
  "5": "12:00 pm",
  "6": "1:00 pm",
  "7": "2:00 pm",
  "8": "3:00 pm",
  "9": "4:00 pm",
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
app.get("/is-time-available", (request, response) => {
  console.log("request.url", request.url);
  console.log("request", request.query);
  const {
    building,
    floor: queryFloor,
    date: queryDate,
    time: queryTime,
  } = request.query;
  const floor = Number(queryFloor);
  const date = new Date(queryDate);
  const time = new Date(`${queryDate} ${HOURS[queryTime]}`);

  const accessRequestedFor = new Date(`${queryDate} ${HOURS[queryTime]}`);

  console.log("building", building);
  console.log("floor", floor);
  console.log("date", date);
  console.log("time", time);
  console.log("accessRequestedFor", accessRequestedFor);

  response.type("application/json");
  if (
    accessRequestedFor.getDay() === DAYS.TUESDAY ||
    accessRequestedFor.getHours() === HOURS.NOON ||
    floor === 13
  ) {
    response.status(200);
    response.send({ isAllowed: false });
    return;
  }

  response.status(200);
  response.send({ isAllowed: true });
});

app.listen(listenPort, () =>
  console.log(`Example app listening at http://localhost:${listenPort}`)
);
