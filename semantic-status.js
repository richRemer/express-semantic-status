import {STATUS_CODES} from "http";

const senders = {};

// information status codes

export function continu() {
  return respond(100, "Continue");
}

export function switchingProtocols(upgrade) {
  const headers = {Upgrade: upgrade};
  return respond(101, headers, "Switching Protocols");
}

export function processing() {
  return respond(102, "Processing");
}

export function earlyHints(...links) {
  const headers = {Link: links};
  return respond(103, "Early Hints");
}

// successful status codes

export function ok() {
  return respond(200, "OK");
}

export function created() {
  return respond(201, "Created");
}

export function accepted() {
  return respond(202, "Accepted");
}

export function nonAuthoritativeInformation() {
  return respond(203, "Non-Authoritative Information");
}

export function noContent() {
  return respond(204, "");
}

export function resetContent() {
  return respond(205, "Reset Content");
}

export function partialContent() {
  return respond(206, "Partial Content");
}

export function multiStatus() {
  return respond(207, "Multi-Status");
}

export function alreadyReported() {
  return respond(208, "Already Reported");
}

export function imUsed() {
  return respond(226, "IM Used");
}

// redirection status codes

export function multipleChoices(location=null) {
  const headers = {};
  if (location) headers.Location = location;
  return respond(300, headers, "Multiple Choices");
}

export function movedPermanently(location) {
  const headers = {Location: location};
  return respond(301, headers, `Moved Permanently: ${location}`);
}

export function found(location) {
  const headers = {Location: location};
  return respond(302, headers, `Found: ${location}`);
}

export function seeOther(location) {
  const headers = {Location: location};
  return respond(303, headers, `See Other: ${location}`);
}

export function notModified() {
  return respond(304, "Not Modified");
}

export function useProxy() {
  if (!useProxy.warned) {
    useProxy.warned = true;
    console.warn("HTTP status code 305 Use Proxy is deprecated");
  }

  return respond(305, "Use Proxy");
}

export function temporaryRedirect(location) {
  const headers = {Location: location};
  return respond(307, `Temporary Redirect: ${location}`);
}

export function permanentRedirect(location) {
  const headers = {Location: location};
  return respond(308, `Permanent Redirect: ${location}`);
}

// client error status codes

export function badRequest(reason) {
  return respond(400, `Bad Request: ${reason}`);
}

export function unauthorized(scheme, params={}) {
  params = Object.keys(params).map(k => `${k}="${params[k]}"`).join(", ");

  const auth = params ? `${scheme} ${params}` : scheme;
  const headers = {"WWW-Authenticate": auth};

  return respond(401, headers, "Unauthorized");
}

export function paymentRequired() {
  return respond(402, "Payment Required");
}

export function forbidden() {
  return respond(403, "Forbidden");
}

export function notFound() {
  return respond(404, "Not Found");
}

export function methodNotAllowed(...allowed) {
  const headers = {"Allow": allowed.join(",")};
  return respond(405, headers, "Method Not Allowed");
}

export function notAcceptable() {
  return respond(406, "Not Acceptable");
}

export function proxyAuthenticationRequired() {
  return respond(407, "Proxy Authentication Required");
}

export function requestTimeout() {
  return respond(408, "Request Timeout");
}

export function conflict(reason) {
  if (reason) reason = `: ${reason}`;
  return respond(409, `Conflict${reason}`);
}

export function gone() {
  return respond(410, "Gone");
}

export function lengthRequired() {
  return respond(411, "Length Required");
}

export function preconditionFailed() {
  return respond(412, "Precondition Failed");
}

export function payloadTooLarge() {
  return respond(413, "Payload Too Large");
}

export function uriTooLong() {
  return respond(414, "URI Too Long");
}

export function unsupportedMediaType() {
  return respond(415, "Unsupported Media Type");
}

export function rangeNotSatisfiable() {
  return respond(416, "Range Not Satisfiable");
}

export function expectationFailed() {
  return respond(417, "Expectation Failed");
}

export function imATeapot() {
  return respond(418, "I'm a Teapot");
}

export function misdirectedRequest() {
  return respond(421, "Misdirected Request");
}

export function unprocessableEntity() {
  return respond(422, "Unprocessable Entity");
}

export function locked() {
  return respond(423, "Locked");
}

export function failedDependency() {
  return respond(424, "Failed Dependency");
}

export function tooEarly() {
  return respond(425, "Too Early");
}

export function upgradeRequired() {
  return respond(426, "Upgrade Required");
}

export function preconditionRequired() {
  return respond(428, "Precondition Required");
}

export function tooManyRequests() {
  return respond(429, "Too Many Requests");
}

export function requestHeaderFieldsTooLarge() {
  return respond(431, "Request Header Fields Too Large");
}

export function unavailableForLegalReasons() {
  return respond(451, "Unavailable For Legal Reasons");
}

// server error status codes

export function internalServerError() {
  return respond(500, "Internal Server Error");
}

export function notImplemented() {
  return respond(501, "Not Implemented");
}

export function badGateway() {
  return respond(502, "Bad Gateway");
}

export function serviceUnavailable() {
  return respond(503, "Service Unavailable");
}

export function gatewayTimeout() {
  return respond(504, "Gateway Timeout");
}

export function httpVersionNotSupported() {
  return respond(505, "HTTP Version Not Supported");
}

export function variantAlsoNegotiates() {
  return respond(506, "Variant Also Negotiates");
}

export function insufficientStorage() {
  return respond(507, "Insufficient Storage");
}

export function loopDetected() {
  return respond(508, "Loop Detected");
}

export function bandwidthLimitExceeded() {
  return respond(509, "Bandwidth Limit Exceeded");
}

export function notExtended() {
  return respond(510, "Not Extended");
}

export function networkAuthenticationRequired() {
  return respond(511, "Network Authentication Required");
}

// helpers to build exported functions

function respond(status, headers, body) {
  if (typeof headers === "string") {
    [headers, body] = [{}, headers];
  }

  body += "\n";

  return function respond(req, res) {
    res.status(status);
    Object.entries(headers).forEach(([name, value]) => res.set(name, value));
    if (body) res.send(body); else res.send();
  }
}

function send(fn, name="send" + fn.name[0].toUpperCase() + fn.name.slice(1)) {
  return Object.defineProperty(function(...args) {
    const listener = fn(...args);
    const req = {};
    listener(req, this);
  }, "name", {
    configurable: true,
    value: name
  });
}

// middleware to add sendX methods to response

export function semantics() {
  return function addSemantics(req, res, next) {
    Object.assign(res, senders);
    next();
  }
}

// senders for attaching to response object

senders.sendContinue = send(continu, "sendContinue");
senders.sendSwitchingProtocols = send(switchingProtocols);
senders.sendProcessing = send(processing);
senders.sendEarlyHints = send(earlyHints);

senders.sendOK = send(ok, "sendOK");
senders.sendCreated = send(created);
senders.sendAccepted = send(accepted);
senders.sendNonAuthoritativeInformation = send(nonAuthoritativeInformation);
senders.sendNoContent = send(noContent);
senders.sendResetContent = send(resetContent);
senders.sendPartialContent = send(partialContent);
senders.sendMultiStatus = send(multiStatus);
senders.sendAlreadyReported = send(alreadyReported);
senders.sendIMUsed = send(imUsed, "sendIMUsed");

senders.sendMultipleChoicese = send(multipleChoices);
senders.sendMovedPermanently = send(movedPermanently);
senders.sendFound = send(found);
senders.sendSeeOther = send(seeOther);
senders.sendNotModified = send(notModified);
senders.sendUseProxy = send(useProxy);
senders.sendTemporaryRedirect = send(temporaryRedirect);
senders.sendPermanentRedirect = send(permanentRedirect);

senders.sendBadRequest = send(badRequest);
senders.sendUnauthorized = send(unauthorized);
senders.sendPaymentRequired = send(paymentRequired);
senders.sendForbidden = send(forbidden);
senders.sendFound = send(notFound);
senders.sendMethodNotAllowed = send(methodNotAllowed);
senders.sendNotAcceptable = send(notAcceptable);
senders.sendProxyAuthenticationRequired = send(proxyAuthenticationRequired);
senders.sendRequestTimeout = send(requestTimeout);
senders.sendConflict = send(conflict);
senders.sendGone = send(gone);
senders.sendLengthRequired = send(lengthRequired);
senders.sendPreconditionFailed = send(preconditionFailed);
senders.sendPayloadTooLarge = send(payloadTooLarge);
senders.sendURITooLong = send(uriTooLong, "sendURITooLong");
senders.sendUnsupportedMediaType = send(unsupportedMediaType);
senders.sendRangeNotSatisfiable = send(rangeNotSatisfiable);
senders.sendExpectationFailed = send(expectationFailed);
senders.sendImATeapot = send(imATeapot);
senders.sendMisdirectedRequest = send(misdirectedRequest);
senders.sendUnprocessableEntity = send(unprocessableEntity);
senders.sendLocked = send(locked);
senders.sendFailedDependency = send(failedDependency);
senders.sendTooEarly = send(tooEarly);
senders.sendUpgradeRequired = send(upgradeRequired);
senders.sendPreconditionFailed = send(preconditionRequired);
senders.sendTooManyRequests = send(tooManyRequests);
senders.sendRequestHeaderFieldsTooLarge = send(requestHeaderFieldsTooLarge);
senders.sendUnavailableForLegalReasons = send(unavailableForLegalReasons);

senders.sendInternalServerError = send(internalServerError);
senders.sendNotImplemented = send(notImplemented);
senders.sendBadGateway = send(badGateway);
senders.sendServiceUnavailable = send(serviceUnavailable);
senders.sendGatewayTimeout = send(gatewayTimeout);
senders.sendHTTPVersionNotSupported = send(httpVersionNotSupported, "sendHTTPVersionNotSupported");
senders.sendVariantAlsoNegotiates = send(variantAlsoNegotiates);
senders.sendInsufficientStorage = send(insufficientStorage);
senders.sendLoopDetected = send(loopDetected);
senders.sendBandwidthLimitExceeded = send(bandwidthLimitExceeded);
senders.sendNotExtended = send(notExtended);
senders.sendNetworkAuthenticationRequired = send(networkAuthenticationRequired);
