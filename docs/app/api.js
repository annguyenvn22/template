(function () {
    'use strict';

    angular
        .module('xxxTemplatexxx.documentation')
        .controller('ApiController', ApiController);

    ApiController.$inject = ["API_DATA"];
    function ApiController(API_DATA) {

        var vm = this;

        vm.allPages = API_DATA;

    }

})();
