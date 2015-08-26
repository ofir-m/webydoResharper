app.factory('sitesResource', function($resource)
{
    return $resource('/api/sites');
})
