var strava = require('strava-v3');
var express = require('express');
var app = express();

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/bower_components', express.static('bower_components'));

app.get('/', function(req, res){
    res.sendFile('index.html', {'root':__dirname});
});

app.get('/api/heartrate', function(req, res){
    strava.streams.activity({'id': 565715805, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            res.json(payload);
        }
        else {
            console.log(err);
        }
    });
});

app.listen(8080, function(){
  console.log('Example app listening on port 8080');
});
