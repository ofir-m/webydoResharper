app.controller('removeHeaderFooterController', function ($scope, $element, $rootScope,sitesResource)
{
    $scope.sourceSite=9168243;
    $scope.targetSite=9168297;

    $scope.removeHeader = function(parameters)
    {
        sitesResource.save({sourceSite: $scope.sourceSite, targetSite: $scope.targetSite,removeHeader:true});

    }
    $scope.removeFooter = function(parameters)
    {
        sitesResource.save({sourceSite: $scope.sourceSite, targetSite: $scope.targetSite,removeFooter:true});

    }
    $scope.removeAll = function(parameters)
    {
        sitesResource.save({sourceSite: $scope.sourceSite, targetSite: $scope.targetSite,removeAll:true});

    }
    $scope.convertRepeaters = function(parameters)
    {
        sitesResource.save({sourceSite: $scope.sourceSite, targetSite: $scope.targetSite,convertRepeaters:true});

    }
    $scope.undo = function (parameters) {
        console.log('sourceSite = ' + $scope.sourceSite);
        console.log('targetSite = ' + $scope.targetSite);
    }
})