'use strict';

(function() {
  angular.module('openshiftConsole').component('mobileClientBinding', {
    controller: [
      MobileClientBinding
    ],
    bindings: {
      provider: '<',
      mobileClient: '<?'
    },
    templateUrl: 'views/directives/mobile-bindings.html'
  });

  function MobileClientBinding() {
    var ctrl = this;

    ctrl.$onInit = function() {
      ctrl.consumerInstance = ctrl.mobileClient;
      ctrl.parameterData = {
        CLIENT_ID: _.get(ctrl.mobileClient, 'metadata.name')
      };
    };

    ctrl.$onChanges = function(changes) {
      if (changes.mobileClient && changes.mobileClient.currentValue) {
        ctrl.consumerInstance = ctrl.mobileClient;
      }
    };
  }
})();