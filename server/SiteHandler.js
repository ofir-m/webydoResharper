var q = require('q');
var worker = require('./worker');
var siteLoader = require('./siteLoader');
var Site = require('./site.js')

var SiteHandler = function (userId, sourceSiteId, targetSiteId,action)
{

    siteLoader.load(userId, sourceSiteId).then(function (sourceSite)
    {
        var targetSite =new Site(userId,targetSiteId);
        worker.doWork(sourceSite,targetSite,action);
    })
}


module.exports = SiteHandler;