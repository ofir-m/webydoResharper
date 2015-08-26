var General = require('./general.js');
var general = new General();
var BreakPointsManager = require('./breakPointsManager.js');
var breakPointsManager = new BreakPointsManager();
var config = require('./config.js');
function Utils()
{
    var self = this;

    this.traversePageControls = function (page, callback)
    {
        this.traverseControls(page.controls, callback);
    };
    this.traverseControls = function (controls, callback)
    {
        for (var index = 0; index < controls.length; index++)
        {
            var control = controls[index];
            if (callback)
            {
                callback(control, index);
            }
        }
    };
    //this.removeMainContent = function(page, mainContent)
    //{
    //    var mainContentIndex = mainContent.properties.index;
    //    utils.removeControlFromPage(page, mainContentIndex);
    //};
    this.removeMainRow = function (page, mainContent)
    {
        var mainRowIndex = mainContent.properties.parentIndex;
        this.removeControlFromPage(page, mainRowIndex);
        var mainContentIndex = mainContent.properties.index;
        this.removeControlFromPage(page, mainContentIndex);
    };


    this.traverseInnerPages = function (site, callback)
    {
        var readOnlyInnerPages = this.cloneControl(site.innerPages);
        for (var index = 0; index < site.innerPages.length; index++)
        {
            var innerPage = site.innerPages[index];
            var readOnlyInnerPage = readOnlyInnerPages[index];
            var innerHeader = this.getMainContent(innerPage, general.enumMainContentType.MainContentHeader),
                innerCenter = this.getMainContent(innerPage, general.enumMainContentType.MainContentCenter),
                innerFooter = this.getMainContent(innerPage, general.enumMainContentType.MainContentFooter);
            var innerHeaderfitToHeightChildren = this.getControlFitToHeightChildren(innerPage, innerHeader);
            var innerCenterfitToHeightChildren = this.getControlFitToHeightChildren(innerPage, innerCenter);
            if (callback)
            {
                callback(index, innerPage, readOnlyInnerPage, innerHeader, innerCenter, innerFooter, innerCenterfitToHeightChildren, innerHeaderfitToHeightChildren);
            }
        }
    };
    this.traversePageControls = function (page, callback)
    {
        for (var index = 0; index < page.children.length; index++)
        {
            var childIndex = page.children[index];
            var child = page.controls[childIndex];
            if (child.type == "Removed") continue;
            if (callback)
            {
                callback(child, index);
            }
        }
    };
    this.traverseControlChildren = function (page, control, callback)
    {
        var childrenClone = control.children.slice(0);
        for (var index = 0; index < childrenClone.length; index++)
        {
            var childIndex = childrenClone[index];
            var child = page.controls[childIndex];
            if (child.type == "Removed") continue;
            if (callback)
            {
                callback(child, index);
            }
        }
    };

    this.traverseControlChildren_extended = function (page, originalPage, control, originalControl, callback)
    {
        var childrenClone = control.children.slice(0);
        //  var originalControlClone = originalControl.children.slice(0);
        for (var index = 0; index < childrenClone.length; index++)
        {
            var childIndex = childrenClone[index];
            var child = page.controls[childIndex];
            if (child.type == "Removed") continue;
            var originalChild = originalPage.controls[childIndex] || child;
            if (callback)
            {
                callback(child, originalChild, index);
            }
        }
    };

    function changeControlProperty(control, prop, val)
    {
        control.properties[prop] = val;
        if (general.isBpProperty(prop))
        {
            general.traverseControlBreakPoints(control, function (bp)
            {
                control.breakPoints[bp]['properties'][prop] = val;
            });
        }
    }

    this.setCenterHeight = function (innerPage)
    {
        this.traversePageControls(innerPage, function (control)
        {
            if (control.properties && (control.properties.name == "MainContentCenter"))
            {
                changeControlProperty(control, 'height', '600');
                console.log("found => " + control.type);
                return;
            }
            console.log(control.type);
        });
    };
    this.getMainContent = function (page, mainContentType)
    {
        var controls = page.controls;
        for (var index = 0; index < controls.length; index++)
        {
            var control = controls[index];
            if (control.properties && (control.properties.name == mainContentType))
            {
                return control;
            }
        }
    };

    this.removeControlFromPage = function (page, index)
    {
        var controls = page.controls;
        controls[index] = {};
        controls[index].type = "Removed";
    };
    function getAllSitePagesIdsButOne(site, pageId)
    {
        var pagesIds = site.pagesIds;
        var pagesIdsButOne = [];
        for (var pageName in pagesIds)
        {
            if (pagesIds.hasOwnProperty(pageName))
            {
                var pId = pagesIds[pageName];
                if (pId != pageId)
                {
                    pagesIdsButOne.push(pId);
                }
            }
        }
        return pagesIdsButOne;
    }

    this.getAllSitePagesIdsButOne = function (site, pageId)
    {
        var pagesIds = site.pagesIds;
        var pagesIdsButOne = [];
        for (var pageName in pagesIds)
        {
            if (pagesIds.hasOwnProperty(pageName))
            {
                var pId = pagesIds[pageName];
                if (pId != pageId)
                {
                    pagesIdsButOne.push(pId);
                }
            }
        }
        return pagesIdsButOne;
    };
    function generateControlId(control)
    {
        return control.type + control.properties.index;
    }

    this.addControl = function (page, control, parentControl)
    {
        var controls = page.controls;
        var nextIndex = controls.length;
        control.properties.index = nextIndex;
        controls.push(control);
        control.properties.id = generateControlId(control);
        parentControl.children.push(control.properties.index);
        control.parentIndex = parentControl.properties.index;
        if (page.type === "Master")
        {
            control.properties.pageType = "Master";
        }
        else if (page.type === "Inner")
        {
            control.properties.pageType = "Inner";
        }
        return control;
    };
    //function getControlPageType(control)
    //{
    //    if (page.type === "Master")
    //    {
    //        control.properties.pageType = "Master";
    //    }
    //    else if (page.type === "Inner")
    //    {
    //        control.properties.pageType = "Inner";
    //    }
    //}
    //this.getMaxZIndexOfChildren = function (control)
    //{
    //    var zIndex=0;
    //    this.traverseControlChildren(page, ctrl, function (control)
    //    {
    //        var currZIndex=control.properties.zIndex;
    //        if (currZIndex>zIndex)
    //        {
    //            zIndex=currZIndex;
    //        }
    //    });
    //    return zIndex;
    //};
    this.cloneControl = function (control)
    {
        return JSON.parse(JSON.stringify(control));
    };
    this.createFooterStub = function ()
    {
        var footerElementString = "{type:'Footer',events:{},properties:{originalType:'Footer',index:25,id:'Footer25',internalId:'Footer25_Footer360426',parentIndex:4,top:937,left:-200,initialTop:937,initialLeft:-133,dock:'None',widthType:'0',width:980,heightType:'0',height:283,initialWidth:131,initialHeight:283,borderWidth:0,borderColor:'#000',borderStyle:'solid',paddingTop:0,paddingLeft:0,paddingBottom:0,paddingRight:0,marginTop:0,marginLeft:0,marginBottom:0,marginRight:0,dimLocked:true,boxShadow:'0px 0px 0px 0px rgba(0, 0, 0, 1)',pageType:'Master',isAnchor:false,borderBottomWidth:0,borderTopWidth:0,borderRightWidth:0,borderLeftWidth:0,backgroundColor:'transparent',createdInMode:'pc',zIndex:'0',display:'block',fitToTypeShape:'width',resizeAndFit:false},children:[],breakPoints:{portrait:{properties:{display:'block',width:300,left:0}},landscape:{properties:{display:'block',width:460,left:0}},tablet:{properties:{display:'block',width:748,left:0}},pc:{properties:{display:'block',top:937,initialTop:937,height:283,initialHeight:283,width:1340,left:-200,initialWidth:131}}},blackListPages:[]}";
        return this.STR2JSON(footerElementString);
    };
    this.getControlFitToHeightChildren = function (page, ctrl)
    {
        var controls = [];
        if (!ctrl)
        {
            return controls;
        }
        self.traverseControlChildren(page, ctrl, function (control)
        {
            if (self.isfitToHeightControl(control))
            {
                controls.push(control);
            }
        });
        return controls;
    };
    this.isfitToHeightControl = function (control)
    {
        return control.properties.fitToTypeShape == 'height' || control.properties.fitToTypeShape == 'bg';
    };
    this.removeFitToHeight = function (control)
    {
        var properties = control.properties;
        properties.heightType = '1';
        if (properties.fitToTypeShape == 'height')
        {
            properties.fitToTypeShape = 'none';
        }
        else if (properties.fitToTypeShape == 'bg')
        {
            properties.fitToTypeShape = 'width';
        }
    };

    this.adjustFitToHeight = function (control, bottom, currBp)
    {
        control.properties.heightType = '3'; //height auto
        breakPointsManager.setBreakPointProp(control, 'bottom', bottom, currBp);
    };

    this.removeElementFromArray = function (arr)
    {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length)
        {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1)
            {
                arr.splice(ax, 1);
            }
        }
        return arr;
    };
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

    this.moveControl = function (control, sourceParent, targetParent)
    {
        sourceParent.children = this.removeElementFromArray(sourceParent.children, control.properties.index);
        targetParent.children.push(control.properties.index);
        control.properties.parentIndex = targetParent.properties.index;

    };
    this.moveControlFromInnerToMaster1 = function (innerPage, control, masterPage, targetParent, site)
    {
        var innerPageName = innerPage.properties.name;
        var innerPageId = site.pagesIds[innerPageName];
        var blackListPages = this.getAllSitePagesIdsButOne(site, innerPageId);
        this.moveControlAndItsDescendants(innerPage, control, masterPage, targetParent, setBlackListPages, blackListPages)
    }
    function setBlackListPages(ctrl, blackListPages)
    {
        ctrl.blackListPages = blackListPages;
    }

    this.moveControlAndItsDescendants = function (sourcePage, control, targetPage, targetParent, func, funcParam)
    {

        var movedControl = this.addControl(targetPage, this.cloneControl(control), targetParent);
        movedControl.children = [];
        if (targetPage.type === "Master" && sourcePage.type === "Inner" && func)
        {
            func(movedControl, funcParam)
        }
        this.traverseControlChildren(sourcePage, control, function (child)
        {
            self.moveControlAndItsDescendants(sourcePage,child, targetPage, movedControl, func, funcParam)

        });
        this.removeControlFromPage(sourcePage, control.properties.index);
    }

    this.moveControlFromInnerToMaster = function (control, masterPage, targetParent, innerPage, blackListPages,level)
    {
        var movedControl = this.addControl(masterPage, this.cloneControl(control), targetParent);
        movedControl.children = [];
        if(level===0)
        {
            fixPcLeft(movedControl);
        }

        /*
         * all controls in master page (except layout controls) must be repeat all pages
         */
        movedControl.blackListPages = blackListPages;
        /* move also sub items of gallery or form for example */
        this.traverseControlChildren(innerPage, control, function (child)
        {
            self.moveControlFromInnerToMaster(child, masterPage, movedControl, innerPage, blackListPages,++level)

        });
        this.removeControlFromPage(innerPage, control.properties.index);

    };

    this.setFooterHeight = function (masterPage)
    {
        this.traversePageControls(masterPage, function (control)
        {
            if (control.properties && (control.properties.name == "MainContentFooter"))
            {
                changeControlProperty(control, 'height', '300');
                console.log("found => " + control.type);
                return;
            }
            console.log(control.type);
        });
    };

    this.STR2JSON = function (str)
    {
        str = str.replace(/\r/g, "").replace(/\n/g, "");
        return eval('(' + str + ')');
    };
    this.JSON2STR = function (obj)
    {
        var buf = [];
        var res = "";
        if (obj == null || (typeof (obj) == 'string' && obj.length == 0))
        {
            return null;
        }
        if (typeof (obj) != 'object')
        {
            (typeof (obj) == 'string') ? res = "'" + obj.replace(/\'/g, '\\\'') + "'" : res = obj + "";
        }
        else
        {
            if (obj.length == null)
            { //collection
                for (var item in obj)
                {
                    var val = this.JSON2STR(obj[item]);
                    if (val)
                    {
                        buf.push(item + ":" + val);
                    }
                }
                res = "{" + buf.join(",") + "}";
            }
            else
            { //array
                for (var i = 0; i < obj.length; i++)
                {
                    var val = this.JSON2STR(obj[i]);
                    if (val)
                    {
                        buf.push(val);
                    }
                }
                res = "[" + buf.join(",") + "]";
            }
        }
        return res.replace(/\r/g, "").replace(/\n/g, "");
    }; //function getControlByType(control,type)
    //{
    //    if (control.type == type)
    //    {
    //        console.log(pageName + '      ' + properties.id);
    //        properties.backgroundColor = "#000000";
    //    }
    //}
}

module.exports = Utils;