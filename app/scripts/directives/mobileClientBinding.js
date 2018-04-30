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

    ctrl.$onChanges = function(changes) {
      if (changes.mobileClient && changes.mobileClient.currentValue) {
        ctrl.consumerInstance = ctrl.mobileClient;
      }
    };
  }
})();