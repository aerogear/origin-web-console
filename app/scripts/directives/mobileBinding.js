'use strict';

(function() {
  angular.module('openshiftConsole').component('mobileBinding', {
    controller: [
      '$filter',
      '$scope',
      'APIService',
      'Catalog',
      'DataService',
      MobileBinding
    ],
    bindings: {
      providerServiceClass: '<',
      onCreate: '<',
      onDelete: '<',
      consumerInstance: '<',
      parameterData: '<'
    },
    templateUrl: 'views/directives/mobile-binding.html'
  });

  function MobileBinding(
    $filter,
    $scope,
    APIService,
    Catalog,
    DataService
  ) {
    var ctrl = this;
    var instancePreferredVersion = APIService.getPreferredVersion('serviceinstances');
    var bindingPreferredVersion = APIService.getPreferredVersion('servicebindings');
    var servicePlansVersion = APIService.getPreferredVersion('clusterserviceplans');
    var isBindingReady = $filter('isBindingReady');
    var watches = [];

    ctrl.$onChanges = function(changes) {
      if (changes.consumerInstance && changes.consumerInstance.currentValue &&
          changes.providerServiceClass && changes.providerServiceClass.currentValue &&
          !ctrl.instancePromise) {

        var context = {namespace: _.get(ctrl, 'consumerInstance.metadata.namespace')};

        ctrl.instancePromise = DataService.list(instancePreferredVersion, context, function(serviceInstancesData) {
          var data = serviceInstancesData.by('metadata.name');
          ctrl.checkProviderInstance(data);

          watches.push(DataService.watch(bindingPreferredVersion, context, function(bindingData) {
            var data = bindingData.by('metadata.name');

            ctrl.binding = _.find(data, function(binding) {
              var bindingProviderName = _.get(binding, ['metadata', 'annotations', 'binding.aerogear.org/provider']);
              var bindingConsumerName = _.get(binding, ['metadata', 'annotations', 'binding.aerogear.org/consumer']);
              var consumerInstanceName = _.get(ctrl, 'consumerInstance.metadata.name');
              var providerServiceInstanceName = _.get(ctrl, 'providerServiceInstance.metadata.name');
              return (bindingProviderName && bindingConsumerName && consumerInstanceName && bindingProviderName === providerServiceInstanceName && bindingConsumerName === consumerInstanceName);
            });
            ctrl.checkBinding();
          }));
        });

        watches.push(DataService.watch(instancePreferredVersion, context, function(serviceInstancesData) {
          var data = serviceInstancesData.by('metadata.name');
          ctrl.checkProviderInstance(data);
        }));
      }

      if (changes.consumerInstance && changes.consumerInstance.currentValue &&
          changes.providerServiceClass && changes.providerServiceClass.currentValue &&
          !ctrl.servicePlanPromise) {

        ctrl.servicePlanPromise = DataService.list(servicePlansVersion, {}, function(servicePlans) {
          var servicePlanData = servicePlans.by('metadata.name');
          ctrl.providerServicePlan = _.find(servicePlanData, function(plan) {
            return ctrl.providerServiceClass.metadata.name === plan.spec.clusterServiceClassRef.name;
          });
          var kind = ctrl.consumerInstance.kind.toLowerCase();
          var bindDataPath = 'providerServicePlan.spec.externalMetadata.' + kind + '_bind_parameters_data';
          var bindData = _.get(ctrl, bindDataPath, []);
          ctrl.bindData = _(bindData).map(JSON.parse).value();
        });
      }
    };

    ctrl.checkProviderInstance = function(serviceInstances) {
      ctrl.providerServiceInstance = _.find(serviceInstances, function(serviceInstance) {
        var clusterServiceClassExternalName = _.get(serviceInstance, 'spec.clusterServiceClassExternalName');
        return (clusterServiceClassExternalName === ctrl.providerServiceClass.spec.externalName);
      });

      ctrl.providerInstanceProvisioning = _.get(ctrl, 'providerServiceInstance.status.currentOperation') === 'Provision';
      ctrl.providerInstanceDeprovisioning = _.get(ctrl, 'providerServiceInstance.status.currentOperation') === 'Deprovision';

      ctrl.bindingMeta = {
        annotations: {
          'binding.aerogear.org/consumer': _.get(ctrl, 'consumerInstance.metadata.name'),
          'binding.aerogear.org/provider': _.get(ctrl, 'providerServiceInstance.metadata.name')
        }
      };
    };

    ctrl.checkBinding = function() {
      var currentOperation = _.get(ctrl, 'binding.status.currentOperation', '').toLowerCase();
      if (ctrl.binding && currentOperation === 'bind') {
        ctrl.hasBinding = false;
        ctrl.isBindPending = true;
      }
      if (ctrl.binding && isBindingReady(ctrl.binding)) {
        ctrl.hasBinding = true;
        ctrl.isBindPending = false;
      }
      if (!ctrl.binding) {
        ctrl.hasBinding = false;
        ctrl.isBindPending = false;
      }
      if (ctrl.binding && currentOperation === 'unbind') {
        ctrl.hasBinding = false;
        ctrl.isBindPending = true;
      }
    };

    ctrl.bindingPanelVisible = false;

    ctrl.closeBindingPanel = function() {
      ctrl.bindingPanelVisible = false;
    };

    ctrl.openBindingPanel = function() {
      ctrl.parameterData = _.reduce(ctrl.bindData, function(acc, current) {
        if (current.type === 'path') {
          acc[current.name] = _.get(ctrl, 'consumerInstance.' + current.value);
        } else if (current.type === 'default') {
          acc[current.name] = current.value;
        }
        return acc;
      },{});
      ctrl.bindingPanelVisible = true;
    };

    ctrl.provision = function() {
      $scope.$emit('open-overlay-panel', Catalog.getServiceItem(ctrl.providerServiceClass));
    };

    ctrl.$onDestroy = function() {
      DataService.unwatchAll(watches);
    };
  }
})();
