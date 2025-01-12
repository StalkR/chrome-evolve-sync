#!/bin/bash
rm -f extension.zip
zip extension.zip background.js content.js icon{16,48,128}.png lz-string.min.js manifest.json
chmod a+r extension.zip
