var Utils = require('./utils.js');
var utils = new Utils();
var BreakPointsManager = require('./breakPointsManager.js');
var breakPointsManager = new BreakPointsManager();
var General = require('./general.js');
var general = new General();
var RepeatOnAllPagesManager = require('./repeatOnAllPagesManager.js');
var Dao = require('./dao.js');
var dao = new Dao();
var config = require('./config.js');
var $ = require('cheerio');

var RepeaterConverter = function (site)
{

    var innerPages = site.innerPages;
    var innerPagesObj = site.innerPagesObj;


    this.convertToJson=function()
    {
        utils.traverseInnerPages(site, function (index, innerPage, readOnlyInnerPage, innerHeader, innerCenter, innerFooter, innerCenterFitToHeightChildren, innerHeaderFitToHeightChildren)
        {
            utils.traversePageControls(innerPage, function (control)
            {
                if (control.type == "Repeater")
                {
                    var t = control.properties.id;
                }
            });

        });
    }


};


module.exports = RepeaterConverter;