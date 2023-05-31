#!/bin/sh

NODE_TLS_REJECT_UNAUTHORIZED='0' ./test.js 

# For web without proper certs
# chromium --args --disable-web-security --allow-running-insecure-content --user-data-dir=/tmp/chrome-insecure/ -ignore-certificate-errors

