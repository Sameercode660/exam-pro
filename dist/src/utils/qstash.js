"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qstash = void 0;
const qstash_1 = require("@upstash/qstash");
exports.qstash = new qstash_1.Client({
    token: process.env.QSTASH_TOKEN,
});
