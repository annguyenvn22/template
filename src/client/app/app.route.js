(function () {
    'use strict';

    angular
        .module('xxxTemplatexxx')
        .config(routeConfiguration);

    /* @ngInject */
    function routeConfiguration($stateProvider) {
        $stateProvider
            .state('xxxTemplatexxx', {
                abstract: true,
                template: '<div ui-view></div>'
            });
    }

})();
