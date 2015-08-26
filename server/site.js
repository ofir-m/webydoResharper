var $ = require('cheerio');
var Site = function(userId, siteId)
{
    this.userId = userId;
    this.id = siteId;
    this.pagesIds = {};
    this.innerPages = [];
    this.innerPagesObj = {};
    this.masterPage = null;
    this.siteTree = null;
};
Site.prototype.setPagesIds = function(siteTree)
{
    var $xml = $(siteTree);

    var self = this;
    $xml.find('item[type="' + 'page' + '"]').each(function()
    {
        var pageId = $(this).attr('id');
        var pageName = $(this).attr('name');
        if (pageId)
        {
            self.pagesIds[pageName] = pageId;
        }
    });
};
Site.prototype.init = function(result)
{
    this.innerPages = result[0].innerPages;
    this.masterPage = result[0].masterPage;
    this.siteTree = result[1];
    this.setPagesIds(this.siteTree);
    for (var i = 0; i < this.innerPages.length; i++)
    {
        var innerPage = this.innerPages[i];
        var pageName = innerPage.properties.name;
        var pageId = this.pagesIds[pageName];
        this.innerPagesObj[pageId] = innerPage;
    }
};

module.exports = Site;