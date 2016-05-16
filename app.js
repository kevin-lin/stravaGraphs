var strava = require('strava-v3');
var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('request');
var app = express();

app.use(cookieParser());
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/bower_components', express.static('bower_components'));

app.use(function(req, res, next){
    // if(req.cookies.access_token === undefined){
    //     res.redirect('/auth');
    // }
    next();
});

app.get('/', function(req, res){
    res.sendFile('index.html', {'root':__dirname});
});

app.get('/auth', function(req, res){
    res.redirect('https://www.strava.com/oauth/authorize?' +
                    'client_id=' + process.env.STRAVA_CLIENT_ID +
                    '&redirect_uri=' + 'http://localhost:8080/auth_redirect' +
                    '&response_type=code' +
                    '&scope=view_private');
});

app.get('/auth_redirect', function(req, res){
    var authorization_code = req.query.code;
    var access_token = '';
    request.post({url: 'https://www.strava.com/oauth/token', form: {client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET, code: authorization_code}}, function(err, response, body){
        var res_obj = JSON.parse(body);
        access_token = res_obj.access_token;
        res.cookie('access_token', access_token);
        strava.athlete.listActivities({'access_token': access_token}, function(err, payload){
            res.json(payload);
            var activityArr = [];
            for(var i = 0; i < payload.length; i += 1){
                activityArr.push({name: payload[i].name, id: payload[i].id});
            }
        });
    });
});

app.get('/api/heartrate', function(req, res){
    strava.streams.activity({'id': 572978386, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            res.json(payload);
        }
        else {
            console.log(err);
        }
    });
});

app.get('/api/heartrate/average', function(req, res){
    strava.streams.activity({'id': 572978386, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            var avghr = Math.round(getAvgHeartrate(payload));
            res.send(avghr.toString());
        }
        else {
            console.log(err);
        }
    });
});

app.get('/api/heartrate/zones', function(req, res){
    strava.streams.activity({'id': 572978386, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            res.json(getHeartrateZones(payload));
        }
        else {
            console.log(err);
        }
    });
});

app.get('/api/heartrate/sufferscore', function(req, res){
    strava.streams.activity({'id': 572978386, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            var sufferScore = Math.round(getSufferScore(payload));
            res.send(sufferScore.toString());
        }
        else {
            console.log(err);
        }
    });
});

app.listen(8080, function(){
  console.log('Example app listening on port 8080');
});

const AUTOPAUSE_INTERVAL = 18;

function getAvgHeartrate(payload){
    var timeArr = payload[0].data;
    var heartrateArr = payload[2].data;
    var numerator = 0;
    var denominator = 0;
    for(var i = 1; i < timeArr.length; i++){
        var timeA = timeArr[i-1];
        var timeB = timeArr[i];
        var timeElapsed = timeB - timeA;
        if(timeElapsed > AUTOPAUSE_INTERVAL)
            continue;
        var hrA = heartrateArr[i-1];
        var hrB = heartrateArr[i];
        var hrAvg = (hrA + hrB) / 2;
        numerator += hrAvg * (timeB - timeA);
        denominator += timeB - timeA;
    }
    return numerator / denominator;
}

function getHeartrateZones(payload){
    var ans = {z1: 0, z2: 0, z3: 0, z4: 0, z5: 0};
    var timeArr = payload[0].data;
    var heartrateArr = payload[2].data;
    for(var i = 1; i < timeArr.length; i++){
        var timeA = timeArr[i-1];
        var timeB = timeArr[i];
        var timeElapsed = timeB - timeA;
        if(timeElapsed > AUTOPAUSE_INTERVAL)
            continue;
        var hrA = heartrateArr[i-1];
        var hrB = heartrateArr[i];
        var hrAvg = (hrA + hrB) / 2;
        if(hrAvg <= 116){
            ans.z1 += timeElapsed;
        } else if(hrAvg <= 154){
            ans.z2 += timeElapsed;
        } else if(hrAvg <= 173){
            ans.z3 += timeElapsed;
        } else if(hrAvg <= 192){
            ans.z4 += timeElapsed;
        } else{
            ans.z5 += timeElapsed;
        }
    }
    return ans;
}

function getSufferScore(payload){
    var hrZones = getHeartrateZones(payload);
    const a = 12 / 3600;
    const b = 24 / 3600;
    const c = 45 / 3600;
    const d = 100 / 3600;
    const e = 120 / 3600;
    return hrZones.z1 * a + hrZones.z2 * b + hrZones.z3 * c + hrZones.z4 * d + hrZones.z5 * e;
}
