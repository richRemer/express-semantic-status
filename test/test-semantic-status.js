import {STATUS_CODES} from "http";
import expect from "expect.js";
import * as http from "express-semantic-status";
import Request from "mock-express-request";
import Response from "mock-express-response";

describe("listeners", () => {
  let req, res;

  beforeEach(() => {
    req = new Request();
    res = new Response({request: req});
  });

  for (const status of [
    100, 102, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 304, 305, 402,
    403, 404, 406, 407, 408, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421,
    422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505,
    506, 507, 508, 509, 510, 511
  ]) {
    const name = getStatusName(status);
    const message = STATUS_CODES[status];

    describe(`.${name}()`, () => {
      beforeEach(() => {
        const listener = http[name]();
        listener(req, res);
      });

      it("should set status code", () => {
        expect(res.statusCode).to.be(status);
      });

      if (status === 204 || status === 304) {
        it("should send an empty body", () => {
          expect(res._getString()).to.be("");
        });
      } else {
        it("should send status message", () => {
          expect(res._getString()).to.be(message + "\n");
        });
      }
    });
  }
});

function getStatusName(status) {
  const message = STATUS_CODES[status];
  const stripped = message.replace(/[^a-z]/ig, "");
  const lowered = stripped[0].toLowerCase() + stripped.slice(1);

  // handle a few special cases
  switch (lowered) {
    case "continue": return "continu";
    case "oK": return "ok";
    case "iMUsed": return "imUsed";
    case "uRITooLong": return "uriTooLong";
    case "imaTeapot": return "imATeapot";
    case "hTTPVersionNotSupported": return "httpVersionNotSupported";
  }

  return lowered;
}
