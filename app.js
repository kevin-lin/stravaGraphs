var strava = require('strava-v3');
var express = require('express');
var cookieParser = require('cookie-parser');
var request = require('request');
var app = express();

app.use(cookieParser());
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));
app.use('/bower_components', express.static('bower_components'));
app.set('views', './views');
app.set('view engine', 'pug');

app.use(function(req, res, next){
    // if(req.cookies.access_token === undefined){
    //     res.redirect('/auth');
    // }
    next();
});

app.get('/', function(req, res){
    res.render('home');
    // res.sendFile('index.html', {'root':__dirname});
});

app.get('/auth', function(req, res){
    res.redirect('https://www.strava.com/oauth/authorize?' +
                    'client_id=' + process.env.STRAVA_CLIENT_ID +
                    '&redirect_uri=' + process.env.STRAVA_REDIRECT_URI +
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
        res.redirect('/activities');
    });
});

app.get('/activities', function(req, res){
    strava.athlete.listActivities({'access_token': req.cookies.access_token}, function(err, payload){
        if(!err){
            res.render('activities', {activityArr: payloadToActivityArr(payload)});
        }
        else
            console.log(err);
    });
});

app.get('/activities/:id', function(req, res){
    var sufferScore = 0;
    strava.streams.activity({'access_token': req.cookies.access_token, 'id': req.params.id, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err){
            sufferScore = Math.round(getSufferScore(payload));
            var heartRateZones = getHeartrateZones(payload);
            res.render('charts', {activityArr: [{name: "foo", id: 123}], sufferScore: sufferScore, heartRateZones: heartRateZones});
        }
        else
            console.log(err);
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

app.get('/api/heartrate/zones/:activity_id', function(req, res){
    strava.streams.activity({'access_token': req.cookies.access_token, 'id': req.params.activity_id, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            res.json(getHeartrateZones(payload));
        }
        else {
            console.log(err);
        }
    });
});

app.get('/api/heartrate/sufferscore/:activity_id', function(req, res){
    strava.streams.activity({'access_token': req.cookies.access_token, 'id': req.params.activity_id, 'types':['heartrate', 'time']},function(err,payload) {
        if(!err) {
            var sufferScore = Math.round(getSufferScore(payload));
            res.send(sufferScore.toString());
        }
        else {
            console.log(err);
        }
    });
});

app.listen(process.env.PORT || 8080, function(){
  console.log('Example app listening on port ' + process.env.PORT || 8080);
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
    var ans = [0,0,0,0,0];
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
            ans[0] += timeElapsed;
        } else if(hrAvg <= 154){
            ans[1] += timeElapsed;
        } else if(hrAvg <= 173){
            ans[2] += timeElapsed;
        } else if(hrAvg <= 192){
            ans[3] += timeElapsed;
        } else{
            ans[4] += timeElapsed;
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
    return hrZones[0] * a + hrZones[1] * b + hrZones[2] * c + hrZones[3] * d + hrZones[4] * e;
}

function payloadToActivityArr(payload){
    var activityArr = [];
    for(var i = 0; i < payload.length; i += 1){
        var name = payload[i].name;
        if(name.length > 20)
            name = name.substring(0,20);
        activityArr.push({name: name, id: payload[i].id});
    }
    return activityArr;
}
