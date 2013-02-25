/*!
 * todo - lib/patch.js
 * zhangmhao@gmail.com
 */

"use strict";

var http = require('http');

if (typeof http.ServerResponse.prototype.redirect === 'undefined') {
  http.ServerResponse.prototype.redirect = function (url, status) {
    this.writeHead(status || 302, {
      Location: url
    });
    this.end();
  };
}
