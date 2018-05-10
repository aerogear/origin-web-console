'use strict';

angular.module('openshiftConsole')
  .filter('mobileClientType', function() {
    return function(mobileClient) {
      return mobileClient ? mobileClient.spec.clientType : undefined;
    };
  });
