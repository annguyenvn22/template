(function () {
    'use strict';

    angular
        .module('xxxTemplatexxx')
        .config(configFn);

    configFn.$inject = ['DEBUG_INFO_ENABLED', '$compileProvider', '$urlRouterProvider', '$locationProvider',
        '$qProvider'];

    function configFn(DEBUG_INFO_ENABLED, $compileProvider, $urlRouterProvider, $locationProvider, $qProvider) {
        // show debug info in development
        $compileProvider.debugInfoEnabled(DEBUG_INFO_ENABLED);

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $qProvider.errorOnUnhandledRejections(false);
    }

})();
