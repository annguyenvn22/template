(function () {
    'use strict';

    angular
        .module('xxxTemplatexxx')
        .service('LoadingService', LoadingService);

    /* @ngInject */
    function LoadingService() {

        var loadingElement = null;

        this.loading    = loading;
        this.loadingOff = loadingOff;

        ////////////////////////////////////

        function loading(message) {
            loadingElement = angular.element('<div class="loading" style="  position: absolute;\n' +
                '    width: 100%;\n' +
                '    height: 100%;\n' +
                '    z-index: 1;\n' +
                '    top: 0;\n' +
                '    left: 0;\n' +
                '    background-color: rgba(1, 1, 5, 0.87) !important;\n ' +
                '    display: flex;\n' +
                '    justify-content: center;\n' +
                '    align-items: center;\n' +
                '    flex-flow: column nowrap;">' +
                '<p style="color: white; font-size: 20px; font-variant: small-caps">' + message + '</p>' +
                '<img src="images/loading.gif">' +
                '</div>');

            angular.element('body').append(loadingElement);
        }

        function loadingOff() {
            loadingElement.remove();
        }

    }

})();
