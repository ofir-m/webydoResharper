function RepeatOnAllPagesManager(site)
{
    this.getWhiteListPages = function(ctrl)
    {
        var whiteListPages = [];
        var pagesIdsArray = Object.keys(site.pagesIds).map(function(k) { return site.pagesIds[k] });
        if (!ctrl.blackListPages)
        {
            whiteListPages = pagesIdsArray;
        }
        else
        {
            whiteListPages = pagesIdsArray.filter(function(i) { return ctrl.blackListPages.indexOf(i) < 0; });
        }
        return whiteListPages;
    };
}

module.exports = RepeatOnAllPagesManager;