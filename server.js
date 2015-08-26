var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
//====================================================
var Utils = require('./server/SiteHandler');
var q = require('q');
var Utils = require('./server/utils.js');
var utils = new Utils();
var Dao = require('./server/dao.js');
var dao = new Dao();
var config = require('./server/config.js');
var siteId = config.siteId;
var userId = config.userId;
var Site = require('./server/site.js');
var SiteHandler = require('./server/SiteHandler.js');

var site = new Site(userId, siteId);

//====================================================

console.log('starting....')
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/bower_components', express.static(__dirname + '/bower_components'))
app.post('/api/sites', function (req, res)
{
    var sourceSiteId = req.body.sourceSite;
    var targetSiteId = req.body.targetSite;
    var removeFooter = req.body.removeFooter;
    var removeHeader = req.body.removeHeader;
    var removeAll = req.body.removeAll;
    var convertRepeaters = req.body.convertRepeaters;
    var action = null;
    if (removeHeader)
    {
        action = 'removeHeader';
    } else if (removeFooter)
    {
        action = 'removeFooter';
    } else if (removeAll)
    {
        action = 'removeAll';
    }
    else if (convertRepeaters)
    {
        action = 'convertRepeaters';
    }
    var userId = config.userId;
    var siteHandler = new SiteHandler(userId, sourceSiteId, targetSiteId, action);
    res.end();
})

app.get('*', function (req, res)
{
    console.log('*')
    res.send('what???', 404);
});


app.listen(3002)


module.exports = app;
