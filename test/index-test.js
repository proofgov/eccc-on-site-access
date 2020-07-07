var request = require("request");

describe("index.js", () => {
  describe("#app", () => {
    context("when querying the /is-time-available api", () => {
      context("when no args passed", () => {
        it("return that the time is available", (done) => {
          request(
            "http://localhost:4000/is-time-available",
            (error, response, body) => {
              result = JSON.parse(body);
              expect(result).to.include({ isAvailable: true });
              done();
            }
          );
        });

        it("return always returns success", (done) => {
          request(
            "http://localhost:4000/is-time-available",
            (error, response, body) => {
              expect(response.statusCode).to.eq(200);
              done();
            }
          );
        });
      });
    });

    context("when hitting app root", () => {
      it("finds the welcome page", (done) => {
        request("http://localhost:4000", (error, response, body) => {
          expect(body).to.include("Welcome");
          done();
        });
      });
    });
  });
});
