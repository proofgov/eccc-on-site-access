const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const url = require("url");
const yaml = require("js-yaml");

const timeSlotsPath = path.resolve(APP_ROOT, "data/time_slots.yml");

const { PROOF_URL } = process.env;
const { protocol, hostname, port } = url.parse(PROOF_URL || "");

function loadTimeSlotsDefaults() {
  try {
    return yaml.safeLoad(fs.readFileSync(timeSlotsPath, "utf8"));
  } catch (error) {
    console.log(error);
  }
}

function selectRequestLibrary() {
  return protocol === "https:" ? https : http;
}

module.exports = {
  loadTimeSlotsDefaults,
  requester: selectRequestLibrary(),
  protocol,
  hostname,
  port,
};
