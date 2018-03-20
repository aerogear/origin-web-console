'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileResource', {
    controller: [
      MobileResourceController
    ],
    bindings: {
      excludeResource: '<',
      resource: '<',
      showExclude: '<'
    },
    templateUrl: 'views/directives/mobile-resource.html'
  });

  function MobileResourceController() {
  }
})();