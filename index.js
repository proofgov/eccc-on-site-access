// Entry point
const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");

global.APP_ROOT = Object.freeze(path.dirname(__filename));

const app = express();

const listenPort = 4000;

const {
  loadTimeSlotsDefaults,
  requester,
  protocol,
  hostname,
  port,
} = require(path.resolve(APP_ROOT, "utils/helpers"));

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

app.get("/available-time-slots", (request, response) => {
  console.log("request.url", request.url);
  console.log("request", request.query);

  const { building, floor: queryFloor, date: queryDate } = request.query;
  const floor = Number(queryFloor);
  const accessRequestedFor = new Date(queryDate);

  console.log("building", building);
  console.log("floor", floor);
  console.log("accessRequestedFor", accessRequestedFor);

  let data = {
    availableTimeSlots: timeSlotDefaults,
    info:
      "Access is restricted:\n" +
      "\t - after noon if date is a Tuesday (e.g. 2020/07/07)\n" +
      "\t - accessing floor 13 will remove 9 am from the list.\n",
  };

  const DUMMY_DATE = "2020/07/06";
  if (accessRequestedFor.getDay() !== DAYS.TUESDAY) {
    data.availableTimeSlots = timeSlotDefaults.filter(
      (label, value) => new Date(`${DUMMY_DATE} ${value}`).getHours() > 12
    );
  }

  if (floor === 13) {
    data.availableTimeSlots = timeSlotDefaults.filter(
      (label, value) => new Date(`${DUMMY_DATE} ${value}`).getHours() !== 9
    );
  }

  console.log(
    "response:",
    JSON.stringify(
      {
        status: 200,
        type: "application/json",
        data: data,
      },
      null,
      2
    )
  );
  response.type("application/json");
  response.status(200);
  response.send(data);
});

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

  const accessRequestedFor = new Date(`${queryDate} ${HOURS[queryTime]}`);

  console.log("building", building);
  console.log("floor", floor);
  console.log("accessRequestedFor", accessRequestedFor);

  let data = {
    isAvailable: false,
    info:
      "Access is denied if date is a Tuesday (e.g. 2020/07/07), time=5 or floor=13.",
  };
  if (
    accessRequestedFor.getDay() !== DAYS.TUESDAY &&
    accessRequestedFor.getHours() !== HOURS.NOON &&
    floor !== 13
  ) {
    data.isAvailable = true;
  }

  console.log(
    "response:",
    JSON.stringify(
      {
        status: 200,
        type: "application/json",
        data: data,
      },
      null,
      2
    )
  );
  response.type("application/json");
  response.status(200);
  response.send(data);
});

app.listen(listenPort, () =>
  console.log(`Example app listening at http://localhost:${listenPort}`)
);
