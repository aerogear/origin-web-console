'use strict';

(function () {
  angular.module('openshiftConsole').component('addMobileResource', {
    controller: [
      AddMobileResourceController
    ],
    controllerAs: 'ctrl',
    bindings: {
      add: '<',
      filterResources: '<',
      filterExcluded: '<',
      onClose: '<',
      project: '<',
      resource: '<',
      resources: '<'
    },
    templateUrl: 'views/directives/add-mobile-resource.html'
  });

  function AddMobileResourceController() {
    var ctrl = this;

    ctrl.$doCheck = function () {
      ctrl.excludedResources = ctrl.filterExcluded(ctrl.resource, ctrl.resources);
    };

    ctrl.addMobileResource = function (mobileResource) {
      ctrl.add(mobileResource);
      ctrl.onClose();
    };
  }
})();