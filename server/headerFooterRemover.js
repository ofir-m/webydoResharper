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

var HeaderFooterRemover = function (site)
{
    var repeatOnAllPagesManager = new RepeatOnAllPagesManager(site);
    var masterPage = site.masterPage;
    var innerPages = site.innerPages;
    var innerPagesObj = site.innerPagesObj;
    //var originalInnerPages = utils.cloneControl(innerPages);
    var originalMasterPage = utils.cloneControl(masterPage);
    var masterHeader = utils.getMainContent(masterPage, general.enumMainContentType.MainContentHeader);
    var siteHasHeader = masterHeader.properties.height > 40;


    function addFooterHeightToCenterHeight(innerCenter, masterFooter, originalInnerCenterBpHeight, currBp)
    {
        var masterFooterBpHeight = breakPointsManager.getVirtualBreakPointProp(masterFooter, 'height', currBp);
        var innerCenterNewHeight = parseInt(originalInnerCenterBpHeight) + parseInt(masterFooterBpHeight);
        if (originalInnerCenterBpHeight === NaN || masterFooterBpHeight === NaN)
        {
            return;
        }
        breakPointsManager.setBreakPointHeight(innerCenter, innerCenterNewHeight, currBp);
    }

    function addHeaderHeightToCenterHeight(innerCenter, masterHeader, originalInnerCenterBpHeight, currBp)
    {
        var masterHeaderBpHeight = breakPointsManager.getVirtualBreakPointProp(masterHeader, 'height', currBp);
        var innerCenterNewHeight = parseInt(originalInnerCenterBpHeight) + parseInt(masterHeaderBpHeight);
        if (originalInnerCenterBpHeight === NaN || masterHeaderBpHeight === NaN)
        {
            return;
        }
        breakPointsManager.setBreakPointHeight(innerCenter, innerCenterNewHeight, currBp);
    }


    function fixPcLeft(ctrl)
    {
        if (ctrl.properties.createdInMode === 'pc')
        {
            var originalPcLeft = ctrl.breakPoints['pc'].properties.left || ctrl.properties.left;
            breakPointsManager.traverseControlBreakPoints(ctrl, function (currBp)
            {
                if (currBp === 'pc')
                {
                    ctrl.breakPoints[currBp].properties.left = originalPcLeft + config.PC_MARGIN;
                }
                else if (currBp === 'tablet')
                {
                    if (ctrl.breakPoints[currBp].properties.left === undefined)
                    {
                        ctrl.breakPoints[currBp].properties.left = originalPcLeft;
                    }
                }
            });
        }
    }

    function moveMasterFooterChildrenToNewFooter(masterFooter, newFooter)
    {
        utils.traverseControlChildren(masterPage, masterFooter, function (control)
        {
            utils.moveControl(control, masterFooter, newFooter);
            fixPcLeft(control);
        });
    }


    function moveInnerFooterChildrenToNewFooter(innerPage, innerFooter, newFooter, blackListPages)
    {

        utils.traverseControlChildren(innerPage, innerFooter, function (control)
        {
            utils.moveControlFromInnerToMaster(control, masterPage, newFooter, innerPage, blackListPages, 0)
        });
    }


    function createNewFooterFromMasterFooter(masterFooter)
    {
        var newFooter = utils.createFooterStub();
        newFooter.properties.zIndex= '9999';
        breakPointsManager.traverseControlBreakPoints(masterFooter, function (currBp)
        {
            breakPointsManager.deleteBreakPointProp(newFooter, currBp, 'height')
            var masterFooterBpHeight = breakPointsManager.getBreakPointProp(masterFooter, 'height', currBp);
            breakPointsManager.setBreakPointProp(newFooter, 'height', masterFooterBpHeight, currBp)
            //if (masterFooterBpHeight)
            //{
            //    newFooterBreakPoint.properties.height = masterFooterBpHeight;
            //}
        });
        var masterCenter = utils.getMainContent(masterPage, general.enumMainContentType.MainContentCenter);
        return utils.addControl(masterPage, newFooter, masterCenter);
    }


    function addHeaderHeightToInnerCenterChildrenTop(innerPage, originalInnerPage, innerCenter, originalInnerCenter, currBp, masterHeader, masterCenter)
    {
        var masterHeaderBpHeight = breakPointsManager.getVirtualBreakPointProp(masterHeader, 'height', currBp);
        utils.traverseControlChildren_extended(innerPage, originalInnerPage, originalInnerCenter, innerCenter, function (control, originalControl)
        {
            if (breakPointsManager.isHeigherOrEqualToCreationBreakPoint(control, currBp))
            {
                var controlCurrBpTop = breakPointsManager.getVirtualBreakPointProp(originalControl, 'top', currBp);
                var newTop = controlCurrBpTop * 1 + masterHeaderBpHeight * 1;
                breakPointsManager.setBreakPointProp(control, 'top', newTop, currBp);
            }
            var y = 0;
        });
    };

    function addHeaderHeightToMasterCenterChildrenTop(masterPage, originalMasterPage, originalMasterCenter, currBp, masterHeader, masterCenter)
    {
        var masterHeaderBpHeight = breakPointsManager.getVirtualBreakPointProp(masterHeader, 'height', currBp);
        utils.traverseControlChildren_extended(masterPage, originalMasterPage, originalMasterCenter, masterCenter, function (control, originalControl)
        {
            var newTop = breakPointsManager.getVirtualBreakPointProp(originalControl, 'top', currBp) * 1 + masterHeaderBpHeight * 1;
            breakPointsManager.setBreakPointProp(control, 'top', newTop, currBp);
        });

    };

    function handleMasterCenterFitToControls(masterPage, masterCenter, innerCenterBpHeight, currBp)
    {
        utils.traverseControlChildren(masterPage, masterCenter, function (control)
        {
            if (utils.isfitToHeightControl(control))
            {
                utils.removeFitToHeight(control);
                breakPointsManager.setBreakPointProp(control, 'height', innerCenterBpHeight, currBp);
            }
        });
    }


    function handleInnerCenterFitToControls(innerPage, innerCenter, innerCenterBpHeight, currBp)
    {
        utils.traverseControlChildren(innerPage, innerCenter, function (control)
        {
            if (utils.isfitToHeightControl(control))
            {
                utils.removeFitToHeight(control);
                breakPointsManager.setBreakPointProp(control, 'height', innerCenterBpHeight, currBp);
            }
        });
    }


    function moveMasterHeaderChildrenToMasterCenter(masterHeader, masterCenter)
    {
        utils.traverseControlChildren(masterPage, masterHeader, function (control)
        {
            utils.moveControl(control, masterHeader, masterCenter);
            control.properties.movedFromMasterHeader = true;
        });
    }

    function moveInnerHeaderChildrenToInnerCenter(innerPage, innerHeader, innerCenter, masterHeader)
    {
        utils.traverseControlChildren(innerPage, innerHeader, function (control)
        {
            utils.moveControl(control, innerHeader, innerCenter);
        });
    }

    this.saveAll = function (userId, siteId)
    {
        dao.savePages(userId, siteId, innerPages);
        dao.savePage(userId, siteId, masterPage);
    };


    function removeFitToHeightFromMasterHeaderChildren(masterHeaderfitToHeightChildren, masterHeaderBpHeight, currBp)
    {
        for (var i = 0; i < masterHeaderfitToHeightChildren.length; i++)
        {
            var control = masterHeaderfitToHeightChildren[i];
            utils.removeFitToHeight(control);
            //   breakPointsManager.removeBreakPointProp(control, 'bottom', currBp);
            breakPointsManager.setBreakPointProp(control, 'height', masterHeaderBpHeight, currBp);
        }
    }

    function removeFitToHeightFromControls(controls, heightInPixels, currBp)
    {
        for (var i = 0; i < controls.length; i++)
        {
            var control = controls[i];
            utils.removeFitToHeight(control);
            breakPointsManager.setBreakPointProp(control, 'height', heightInPixels, currBp);
        }
    }

    function removeFitToHeightFromInnerCenterChildren(innerCenterfitToHeightChildren, innerCenterBpHeight, currBp)
    {
        for (var i = 0; i < innerCenterfitToHeightChildren.length; i++)
        {
            var control = innerCenterfitToHeightChildren[i];
            utils.removeFitToHeight(control);
            //breakPointsManager.removeBreakPointProp(control, 'bottom', currBp);
            breakPointsManager.setBreakPointProp(control, 'height', innerCenterBpHeight, currBp);
        }
    }

    function removeFitToHeightFromInnerHeaderChildren(innerHeaderfitToHeightChildren, masterHeaderBpHeight, currBp)
    {
        for (var i = 0; i < innerHeaderfitToHeightChildren.length; i++)
        {
            var control = innerHeaderfitToHeightChildren[i];
            utils.removeFitToHeight(control);
            breakPointsManager.setBreakPointProp(control, 'height', masterHeaderBpHeight, currBp);
            //breakPointsManager.removeBreakPointProp(control, 'bottom', currBp);
        }
    }

    function moveMasterCenterFitToHeightChildrenToInnerCenter(masterCenterFitToHeightChildren, innerCenter, innerPage)
    {
        utils.traverseControls(masterCenterFitToHeightChildren, function (control)
        {
            var controlCopy = utils.cloneControl(control);
            var ctrl = utils.addControl(innerPage, controlCopy, innerCenter);
            delete ctrl.blackListPages;
            utils.removeControlFromPage(masterPage, control.properties.index);
        });
    }

    function moveMasterCenterFitToHeightChildrenToEachInnerCenter()
    {
        var masterCenter = utils.getMainContent(masterPage, general.enumMainContentType.MainContentCenter);
        var masterCenterFitToHeightChildren = utils.getControlFitToHeightChildren(masterPage, masterCenter);
        for (var i = 0; i < masterCenterFitToHeightChildren.length; i++)
        {
            var control = masterCenterFitToHeightChildren[i];
            var whiteListPages = repeatOnAllPagesManager.getWhiteListPages(control);
            for (var k = 0; k < whiteListPages.length; k++)
            {
                var pageId = whiteListPages[k];
                var innerPage = innerPagesObj[pageId];
                var innerCenter = utils.getMainContent(innerPage, general.enumMainContentType.MainContentCenter);
                moveMasterCenterFitToHeightChildrenToInnerCenter(masterCenterFitToHeightChildren, innerCenter, innerPage);
            }
        }
    }
    function adjustFitToHeightInnerCenterChildren(innerCenterfitToHeightChildren, innerFooterBpHeight, currBp)
    {
        for (var i = 0; i < innerCenterfitToHeightChildren.length; i++)
        {
            var fitToHeightChild = innerCenterfitToHeightChildren[i];
            utils.adjustFitToHeight(fitToHeightChild, innerFooterBpHeight, currBp);
        }
    };

    function adjustFitToHeightMasterCenterChildren(masterCenterfitToHeightChildren, innerFooterBpHeight, currBp)
    {
        for (var i = 0; i < masterCenterfitToHeightChildren.length; i++)
        {
            var fitToHeightChild = masterCenterfitToHeightChildren[i];
            utils.adjustFitToHeight(fitToHeightChild, innerFooterBpHeight, currBp);
        }
    };
    function adjustFitToHeightNewFooterChildren(newFooterFitToHeightChildren)
    {
        for (var i = 0; i < newFooterFitToHeightChildren.length; i++)
        {
            var fitToHeightChild = newFooterFitToHeightChildren[i];
            breakPointsManager.traverseControlBreakPoints(fitToHeightChild, function (currBp)
            {
                utils.adjustFitToHeight(fitToHeightChild, '0', currBp);
            });

        }
    };
    function adjustFitToHeightCenterChildren(innerPage, innerCenterfitToHeightChildren, masterCenterfitToHeightChildren, newFooter, masterCenter, currBp, isFirstPage)
    {
        var innerFooterBpHeight = breakPointsManager.getVirtualBreakPointProp(newFooter, 'height', currBp);
        adjustFitToHeightInnerCenterChildren(innerCenterfitToHeightChildren, innerFooterBpHeight, currBp);
        if (isFirstPage)
        {
            /*
             * should execute once, because innerFooterBpHeight is equal for all pages
             */
            adjustFitToHeightMasterCenterChildren(masterCenterfitToHeightChildren, innerFooterBpHeight, currBp);
        }
    }

    this.removeHeader = function ()
    {
        //return;

        var masterHeader = utils.getMainContent(masterPage, general.enumMainContentType.MainContentHeader);
        var masterHeaderFitToHeightChildren = utils.getControlFitToHeightChildren(masterPage, masterHeader);
        var masterCenter = utils.getMainContent(masterPage, general.enumMainContentType.MainContentCenter);
        var masterCenterfitToHeightChildren = utils.getControlFitToHeightChildren(masterPage, masterCenter);
        //moveMasterHeaderChildrenToMasterCenter(masterHeader, masterCenter);
        if (siteHasHeader)
        {
            moveMasterCenterFitToHeightChildrenToEachInnerCenter();
            /* now we do not have any fitToHeight controls in masterCenter */
        }
        var originalInnerPages = utils.cloneControl(innerPages);
        utils.removeMainRow(masterPage, masterHeader);
        utils.traverseInnerPages(site, function (index, innerPage, readOnlyInnerPage, innerHeader, innerCenter, innerFooter, innerCenterFitToHeightChildren, innerHeaderFitToHeightChildren)
        {
            var originalInnerPage = originalInnerPages[index];
            var pageName = innerPage.properties.name;
            //if (innerPage.properties.name != 'home')
            //{
            //    return;
            //}
            var isFirstPage = index == 0;
            if (siteHasHeader)
            {
                var originalInnerCenter = utils.cloneControl(innerCenter);
                var originalMasterCenter = utils.cloneControl(masterCenter);
                breakPointsManager.traverseControlBreakPoints(masterHeader, function (currBp)
                {
                    var masterHeaderBpHeight = breakPointsManager.getVirtualBreakPointProp(masterHeader, 'height', currBp);
                    // var masterCenterBpHeight = breakPointsManager.getVirtualBreakPointProp(masterCenter, 'height', currBp);
                    var originalInnerCenterBpHeight = breakPointsManager.getVirtualBreakPointProp(originalInnerCenter, 'height', currBp);

                    /* remove fit to height from header controls */
                    removeFitToHeightFromControls(innerHeaderFitToHeightChildren, masterHeaderBpHeight, currBp);
                    if (isFirstPage)
                    {
                        removeFitToHeightFromControls(masterHeaderFitToHeightChildren, masterHeaderBpHeight, currBp);
                    }
                    /*******************************************************/


                    /* add header height to center height */
                    addHeaderHeightToCenterHeight(innerCenter, masterHeader, originalInnerCenterBpHeight, currBp);
                    /*******************************************************/

                    /* push center children down */
                    addHeaderHeightToInnerCenterChildrenTop(innerPage, originalInnerPage, innerCenter, originalInnerCenter, currBp, masterHeader, masterCenter);
                    if (isFirstPage)
                    {
                        addHeaderHeightToMasterCenterChildrenTop(masterPage, originalMasterPage, originalMasterCenter, currBp, masterHeader, masterCenter);
                    }
                    /*******************************************************/

                    /* remove fit to height from center controls */
                    removeFitToHeightFromControls(innerCenterFitToHeightChildren, originalInnerCenterBpHeight, currBp);

                });
                moveInnerHeaderChildrenToInnerCenter(innerPage, innerHeader, innerCenter, masterHeader);
            }
            moveMasterHeaderChildrenToMasterCenter(masterHeader, masterCenter);
            utils.removeMainRow(innerPage, innerHeader);
        });

        console.log('complete removeHeader');
    };


    this.removeFooter = function ()
    {
        var masterFooter = utils.getMainContent(masterPage, general.enumMainContentType.MainContentFooter);
        var newFooter = createNewFooterFromMasterFooter(masterFooter);
        moveMasterFooterChildrenToNewFooter(masterFooter, newFooter);
        utils.removeMainRow(masterPage, masterFooter);

        var masterCenter = utils.getMainContent(masterPage, general.enumMainContentType.MainContentCenter);
        var masterCenterFitToHeightChildren = utils.getControlFitToHeightChildren(masterPage, masterCenter);
        if (siteHasHeader)
        {
            moveMasterCenterFitToHeightChildrenToEachInnerCenter();
        }

        utils.traverseInnerPages(site, function (index, innerPage, readOnlyInnerPage, innerHeader, innerCenter, innerFooter, innerCenterFitToHeightChildren)
        {
            // var pageName = innerPage.properties.name;
            var innerPageName = innerPage.properties.name;

            //  if (innerPage.properties.name != 'home')  return ;
            var originalInnerCenter = utils.cloneControl(innerCenter);
            var isFirstPage = index == 0;
            breakPointsManager.traverseControlBreakPoints(innerCenter, function (currBp)
            {
                /*
                 * why not getting bp height simply from innerCenter we loop through?
                 * because getVirtualBreakPointProp may get the bp height from a higher bp
                 * which may be looped already, and therefore added the footer height.
                 * and now we are going to add it again.
                 */
                var originalInnerCenterBpHeight = breakPointsManager.getVirtualBreakPointProp(originalInnerCenter, 'height', currBp);

                if (siteHasHeader)
                {
                    removeFitToHeightFromControls(innerCenterFitToHeightChildren, originalInnerCenterBpHeight, currBp);
                }
                else
                {


                   // adjustFitToHeightCenterChildren(innerPage, innerCenterFitToHeightChildren, masterCenter, currBp);
                    adjustFitToHeightCenterChildren(innerPage, innerCenterFitToHeightChildren, masterCenterFitToHeightChildren, newFooter, masterCenter, currBp, isFirstPage);
                }


                addFooterHeightToCenterHeight(innerCenter, masterFooter, originalInnerCenterBpHeight, currBp);
            });
            var innerPageId = site.pagesIds[innerPageName];
            var blackListPages = utils.getAllSitePagesIdsButOne(site, innerPageId);
            moveInnerFooterChildrenToNewFooter(innerPage, innerFooter, newFooter, blackListPages)

            utils.removeMainRow(innerPage, innerFooter);
        });
        var newFooterFitToHeightChildren = utils.getControlFitToHeightChildren(masterPage, newFooter);
        adjustFitToHeightNewFooterChildren(newFooterFitToHeightChildren);
        console.log('complete removeFooter');
    };
};


module.exports = HeaderFooterRemover;