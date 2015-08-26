function BreakPointsManager(parameters)
{
    this.enumBreakPointProperty = {
        top: "top",
        left: "left",
        width: "width",
        height: "height",
        imageWidth: "imageWidth",
        imageHeight: "imageHeight",
        imageLeft: "imageLeft",
        imageTop: "imageTop",
        fittingType: "fittingType",
        imagePositionType: "imagePositionType",
        initialTop: "initialTop",
        initialLeft: "initialLeft",
        initialWidth: "initialWidth",
        initialHeight: "initialHeight",
        VideoWidth: "VideoWidth",
        VideoHeight: "VideoHeight"
    };
    this.enumBreakPoints = {
        pc: "pc",
        landscape: "landscape",
        portrait: "portrait",
        tablet: "tablet"
    };

    var breakPoints = ['pc', 'tablet', 'landscape', 'portrait'];

    function getPreviousBreakPoint(bp)
    {
        var bpIndex = breakPoints.indexOf(bp);
        return breakPoints[bpIndex - 1];
    };

    this.isBpProperty = function(prop)
    {
        for (var currProp in this.enumBreakPointProperty)
        {
            if (this.enumBreakPointProperty.hasOwnProperty(currProp))
            {
                if (currProp === prop)
                {
                    return true;
                }
            }
        }
        return false;
    };
    this.traverseControlBreakPoints = function(control, callback)
    {
        var index = 0;
        for (var bp in this.enumBreakPoints)
        {
            if (this.enumBreakPoints.hasOwnProperty(bp))
            {
                index++;
                callback(bp,index);
            }
        }
    };
    this.deleteBreakPointProp= function(control, bp,prop)
    {
        var breakPoint = control.breakPoints[bp];
        delete breakPoint.properties[prop];

    };
    this.getBreakPointHeight = function(control, bp)
    {
        return this.getBreakPointProp(control, 'height', bp);
    };
    this.getBreakPointProp = function(control, prop, bp)
    {
        return control.breakPoints[bp].properties[prop];
    };
    this.getVirtualBreakPointProp = function(control, prop, bp)
    {
        var value = control.breakPoints[bp].properties[prop];
        if (value)
        {
            return value;
        }
        else if (bp == 'pc')
        {
            return control.properties[prop];
        }
        else
        {
            return this.getVirtualBreakPointProp(control, prop, getPreviousBreakPoint(bp));
        }
    };
    this.isHeigherOrEqualToCreationBreakPoint=function(control,bp)
    {
        var bpIndex = breakPoints.indexOf(bp);
        var creationBp = control.properties.createdInMode;
        var creationBpIndex = breakPoints.indexOf(creationBp);
        return bpIndex >= creationBpIndex;
    }
    this.breakPointPropExists = function(control, bp, prop)
    {
        return control.breakPoints[bp].properties[prop] !== undefined;
    };
    this.setBreakPointProp = function(control, prop, val, bp)
    {
        control.breakPoints[bp].properties[prop] = val;
    };
    this.removeBreakPointProp = function (control, prop,bp)
    {
        delete control.breakPoints[bp].properties[prop];
    };
    this.setBreakPointHeight = function(control, val, bp)
    {
        this.setBreakPointProp(control, 'height', val, bp);
    };
}

module.exports = BreakPointsManager;