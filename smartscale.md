## Simulate a smartscale update

(await fetch("http://localhost/wp-json/foodcoop/v1/setSmartScaleData", {
  method: "POST",
headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ source: "fdwinti", data:{
    "status": "connected",
    "time": 1776084430,
    "device": "FF:03:00:67:BE:DB",
    "unit": "g",
    "value": 2000,
    "stable": true,
    "negative": false,
    "tara": false
}})})).text();

## Read smarscale data
http://localhost/wp-json/foodcoop/v1/getSmartScaleData?source=fdwinti

## QR Code Content
{"smartscale":"http://localhost/wp-json/foodcoop/v1/getSmartScaleData?source=fdwinti"}