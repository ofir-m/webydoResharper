
var q = require('q');
var Utils = require('./utils.js');
var utils = new Utils();
var Dao = require('./dao.js');
var dao = new Dao();
var Site = require('./site.js');
var config = require('./config.js');

var SiteLoader = function ()
{
    this.load= function (userId,sourceSiteId)
    {
        var site=new Site(userId,sourceSiteId);
        var deferred = q.defer();

        var promises = [dao.loadSitePages(site), dao.getSiteTree(site)];
        /*
         * load the site
         */
        q.all(promises).then(function (result)
        {

            site.init(result);
            deferred.resolve(site);
            //worker.doWork(site);
        });
        return deferred.promise;
    }

}

module.exports = new SiteLoader();
