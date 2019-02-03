var config = require(__dirname + '/config');
var Uber = require('node-uber');
var express = require('express');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var NodeGeocoder = require('node-geocoder');

var app = express();
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var geocoder = NodeGeocoder(config.geocoder);
var uber = new Uber(config.AfterUberX);

app.get("/", function(req, res) {
   res.render('index');
});

var StartAddressData, DestinationAddressData, geoCheckCounter;

app.post("/getEstimatetion", function(req, res) {

    uber.estimates.getPriceForRouteAsync(
        req.body.StartAddress.lat,
        req.body.StartAddress.lon,
        req.body.DestinationAddress.lat,
        req.body.DestinationAddress.lon)
        .then(function(ret) {
            console.log(ret.prices);
            if (ret.prices) {
                res.render('result', {prices: ret.prices});
            } else {
                res.render('result_error', {StartAddress: StartAddress, DestinationAddress: DestinationAddress});
            }
        })
        .error(function(err) {
            console.error(err.statusCode);
            if (err.statusCode == '422') {
                res.sendStatus(400);
            } else {
                res.sendStatus(500);
            }
    });
});
app.post("/checkAddress", function(req, res) {
    geocoder.geocode(req.body.Address, function(err, ret) {
        console.log(req.body.Address);
        console.log(err);
        console.log(ret);
        if (ret.length) res.send({error: 0, lat: ret[0].latitude, lon: ret[0].longitude, address: ret[0].formattedAddress});
        else res.send({error: 1});
    });
});
app.get("*", function(req, res) {
   res.render('404');
});

app.listen(3000, function () {
    console.log('Listening on port 3000!');
});