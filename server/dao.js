var request = require('request');
var xml2js = require('xml2js');
var parseString = xml2js.parseString;
var $ = require('cheerio');
var Utils = require('./utils.js');
var utils = new Utils();
var siteManager = 'http://studio8-st.webydo.com/siteManager/siteManager.asmx';
//var siteManager = 'http://localhost:30405/SiteManager.asmx';
var config = require('./config.js');

var q = require('q');

function Dao()
{
    function generateUrl(siteManagerMethod, userId,siteId,httpMethod)
    {
        var url = '';
             if (httpMethod == "GET" || !httpMethod)
        {
            url = siteManager + '/' + siteManagerMethod + '?userId=' +userId + '&decryptedSiteId=' + siteId;
        }
        else if (httpMethod == "POST")
        {
            url = siteManager + '/' + siteManagerMethod;
        }
        return url;
    }

    this.loadSitePages = function (site)
    {
        var deferred = q.defer();
        var url = generateUrl('LoadPagesFromNodeJS', site.userId,site.id);
        request.get(url, function (error, response, body)
        {
            if (error)
            {
                deferred.reject(error);
            }
            else if (response.statusCode == 200)
            {
                var innerPages = [];
                var masterPage = null;
                parseString(body, function (err, result)
                {
                    if (err)
                    {
                        deferred.reject(err);
                    }
                    var jsonEnvelope = JSON.parse(result.string._);
                    var pages = jsonEnvelope.pages;
                    for (var i = 0; i < pages.length; i++)
                    {
                        var page = pages[i];
                        var pageJson = utils.STR2JSON(page);
                        var pageType = pageJson.type;
                        if (pageType == "Inner")
                        {
                            innerPages.push(pageJson);
                        }
                        else
                        {
                            masterPage = pageJson;
                        }
                    }
                    deferred.resolve({masterPage: masterPage, innerPages: innerPages});

                });
            }
        });
        return deferred.promise;
    };
    this.getPagesIds = function (site)
    {
        this.getSiteTree(site).then(function (xml)
        {
            var $xml = $(xml),
                pagesIds = {};

            $xml.find('item[type="' + 'page' + '"]').each(function ()
            {
                var pageId = $(this).attr('id');
                var pageName = $(this).attr('name');
                if (pageId)
                {
                    pagesIds[pageName] = pageId;
                }
            });
            console.log('complete pagesIds');
        });

    };
    this.getSiteTree = function (site)
    {
        var deferred = q.defer();
        var serviceUrl = generateUrl('GetSiteTreeFromNodeJS',site.userId,site.id, "POST");
        var formData = {userId: site.userId, decryptedSiteId: site.id};
        request.post({url: serviceUrl, form: formData}, function (error, httpResponse, body)
        {
            if (error)
            {
                deferred.reject(error);
            }
            console.log('==============  siteTree ===============');
            parseString(body, function (err, result)
            {
                if (error)
                {
                    deferred.reject(err);
                }
                var xml = result.string._;
                deferred.resolve(xml);
            });
        });
        return deferred.promise;
    };
    this.savePage = function (userId, siteId,page)
    {
        var pageName = page.properties.name;
        var pageType = page.type;
        var pageContent = utils.JSON2STR(page);
        var length = pageContent.length;
        var serviceUrl = pageType == "Master" ? generateUrl('UpdateMasterPageSyncFromNodeJS',userId,siteId) : generateUrl('UpdatePageContentSyncFromNodeJS', userId,siteId);
        var formData = {
            userId: userId,
            decryptedSiteId: siteId,
            pageName: pageName,
            pageType: pageType,
            pageContent: pageContent,
            length: length
        };
        request.post({url: serviceUrl, form: formData}, function (err, httpResponse, body)
        {
            console.log(pageName + ' saved');
        });
    };
    this.savePages = function (userId, siteId, pages)
    {
        for (var j = 0; j < pages.length; j++)
        {
            var page = pages[j];
            this.savePage(userId, siteId,page);
        }
    };

}

module.exports = Dao;