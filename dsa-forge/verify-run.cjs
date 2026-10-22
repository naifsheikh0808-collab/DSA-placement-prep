const path = require("path");
const Module = require("module");

// Map the "@/..." alias used by the source onto the compiled output.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request.startsWith("@/")) {
    request = path.join(__dirname, ".verify-build", "src", request.slice(2));
  }
  return originalResolve.call(this, request, ...args);
};

require("./.verify-build/verify.js");
