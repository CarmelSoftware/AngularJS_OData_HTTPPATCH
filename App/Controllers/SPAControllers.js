var oOrchidsApp = angular.module('OrchidsApp', ['ngRoute','ngResource']);

oOrchidsApp.config(['$routeProvider', function ($routeProvider) {

    $routeProvider

    .when('/',
        {
            templateUrl: "App/Views/OrchidsList.html",
            controller: "OrchidsAllCtl"
        })
    .when('/add',
        {
            templateUrl: "App/Views/OrchidsAdd.html",
            controller: "OrchidsAddCtl"
        })
     .when('/edit/:id',
        {
            templateUrl: "App/Views/OrchidsEdit.html",
            controller: "OrchidsEditCtl"
        })
   
    .otherwise({ redirectTo: "/" });

}]);

oOrchidsApp.value('msg', { value: '' });

oOrchidsApp.factory('GlobalSvc', [function () {

    var oFlowersPictures = ["haeckel_orchidae.jpg", "Bulbophyllum.jpg", "Cattleya.jpg", "Orchid Calypso.jpg", "Paphiopedilum_concolor.jpg", "Peristeria.jpg", "Phalaenopsis_amboinensis.jpg", "Sobralia.jpg"];
    var sURLDev = 'http://localhost:21435/WebAPI/OrchidsWebAPI/';
    var sURLProd = 'http://CARMELWEBAPI.SOMEE.COM/WebAPI/OrchidsWebAPI/';
    var bIsDevelopmentTest = true;
    var sURL = bIsDevelopmentTest ? sURLDev : sURLProd;

    return {
        getFlowers: function () { return oFlowersPictures; },
        getURL: function () { return sURL; }

    };
}]);



oOrchidsApp.factory('OrchidsResource', ['GlobalSvc', '$resource',function (GlobalSvc, $resource) {
   
    return $resource(GlobalSvc.getURL() + ":id", { id: "@id" });
}]);





oOrchidsApp.controller('OrchidsAllCtl', ['GlobalSvc', '$scope', '$http', '$log', 'msg', function (GlobalSvc, $scope, $http, $log, msg) {

    $scope.angularClass = "angular";
    $scope.OrchidsList = [];
    $scope.pageSize = 2;
    var iCurrentPage = -1; 
     

    $scope.fnShowOrchids = function (direction) {

        iCurrentPage = iCurrentPage + direction;
        iCurrentPage = iCurrentPage >= 0 ? iCurrentPage : 0;
        
        var sURL = GlobalSvc.getURL() +
            "?$skip=" +
            iCurrentPage * $scope.pageSize
            + "&$top=" +
            $scope.pageSize;


        $http.get(sURL).success(function (response) {

            $scope.OrchidsList = response;
            $log.info("OK");

        },function (err) { $log.error(err) })
        
        $scope.Message = "";
        
    }

    $scope.fnShowOrchids(1);
    $scope.Message = msg.value;

}
]);

oOrchidsApp.controller('OrchidsAddCtl',
    ['GlobalSvc', '$http', '$scope', '$location', '$log', 'msg',
        function (GlobalSvc, $http, $scope, $location, $log, msg) {
            msg.value = "";
            $scope.Flowers = GlobalSvc.getFlowers();
            
            $scope.fnAdd = function () {

                var oFlower = { "Title": $scope.Orchid.Title, "Text": $scope.Orchid.Text, 
                               "MainPicture": $scope.Orchid.MainPicture };    

                $http({
                    url: GlobalSvc.getURL(),
                    method: "POST",
                    data: oFlower, 
                    headers: { 'Content-Type': 'application/json' }
                }).success(function (data, status, headers, config) {
                    msg.value = "New Orchid saved";
                    $scope.IsSaved = true;
                }).error(function (err) {
                     $log.error(err);
                });                
            }

            $scope.fnShowMsg = function () { return msg.value; }
            
}
]);



oOrchidsApp.controller('OrchidsEditCtl',
    ['OrchidsResource', 'GlobalSvc', '$http', '$routeParams', '$scope', '$location', '$log', 'msg',
        function (OrchidsResource, GlobalSvc, $http, $routeParams, $scope, $location, $log, msg) {

    msg.value = "";
    $scope.Flowers = GlobalSvc.getFlowers();
    $scope.Orchid = OrchidsResource.get({ id: $routeParams.id });

    $scope.fnEdit = function () {
                
        var oFlower = { "BlogId": $routeParams.id , "Title": $scope.Orchid.Title, 
                       "Text": $scope.Orchid.Text, "MainPicture": $scope.Orchid.MainPicture };
        
        $http({
            url: GlobalSvc.getURL() + $routeParams.id,
            method: "PATCH",
            data: oFlower,
            headers: { 'Content-Type': 'application/json' }

        }).success(function (data) { msg.value = "Orchid successfully updated"; }).error(function (err) { });

        
    }
    
    $scope.fnShowMsg = function () { return msg.value; }
}
]);
