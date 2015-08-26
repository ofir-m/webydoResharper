var HeaderFooterRemover = require('./headerFooterRemover.js');
var RepeaterConverter = require('./repeaterConverter');
var Worker = function ()
{
    this.doWork = function (sourceSite, targetSite, action)
    {


        if (action == 'removeHeader')
        {
            var headerFooterRemover = new HeaderFooterRemover(sourceSite);
            headerFooterRemover.removeHeader();
        }
        else if (action == 'removeFooter')
        {
            var headerFooterRemover = new HeaderFooterRemover(sourceSite);
            headerFooterRemover.removeFooter();
        } else if (action == 'removeAll')
        {
            var headerFooterRemover = new HeaderFooterRemover(sourceSite);
            headerFooterRemover.removeHeader();
            headerFooterRemover.removeFooter();
        } else if (action == 'convertRepeaters')
        {
            var repeaterConverter = new RepeaterConverter(sourceSite);
            repeaterConverter.convertToJson();

        }
        headerFooterRemover.saveAll(targetSite.userId, targetSite.id);

    }
}

module.exports = new Worker();
