(function(window, angular, undefined){
  
  angular
    .module('gp.tableUtils',[])
    .run(runFn);
  
  runFn.$inject = ['$templateCache'];
  
  function runFn($templateCache){
    $templateCache.put('pagination.html',
      '<ul class="gp-pagination pagination">\
        <li ng-class="{disabled: vm.actualPage === 1}">\
          <a ng-click="vm.changePage(vm.actualPage - 1)">«</a>\
        </li>\
        <li ng-class="{disabled: vm.actualPage === pageIndex}" ng-repeat="pageIndex in vm.pagesArray">\
          <a ng-bind="pageIndex" ng-click="vm.changePage(pageIndex)"></a>\
        </li>\
        <li ng-class="{disabled: vm.actualPage === vm.pagesArray.length}">\
          <a ng-click="vm.changePage(vm.actualPage + 1)">»</a>\
        </li>\
      </ul>'
    );
  }

  
  angular
    .module('gp.tableUtils')
    .provider('pagination', provider);
  
  function provider(){
    var cssString =
      '<style type="text/css">\
        ul.gp-pagination li{ \
          cursor: pointer; \
        }\
        ul.gp-pagination li.disabled{ \
          pointer-events: none; \
        }\
      </style>';
    this.$get = function($interpolate) {
      var interCss = $interpolate(cssString);
      document.head.insertAdjacentHTML("beforeend", interCss());
    };
  }
  
  angular
    .module('gp.tableUtils')
    .directive('gpPagination', directive);
  
  directive.$inject = ['pagination'];
  
  function directive(pagination){
    var defaults = { perPage : 10 },
        ddo = {
          restrict: 'E',
          templateUrl: 'pagination.html',
          scope: {
            options : '='
          },
          bindToController: true,
          controller: Controller,
          controllerAs: 'vm',
          link: linkFn
        };
    return ddo;
      
    function linkFn(scope, element, attributes, ctrl){
      
      ctrl.options = angular.extend(defaults, ctrl.options);

      var totalItems = ctrl.options.totalItems,
          perPage =  ctrl.options.perPage;

      if(totalItems && totalItems > 0){
        ctrl.pagesArray = ctrl.createPagination(totalItems, perPage);
      }
      else{
        throwError('totalItems');
      }
    }
  }
  
  function throwError(reason){
    switch(reason){
      case 'options':
        throw ('It\'s necessary define a options object in a options attribute.');
        break;
      case 'totalItems':
        throw ('It\'s necessary define a totalItems in the options object and should be > 0.');
        break;
    }
  }
  
  function isFunction(cb){
    return Object.prototype.toString.call(cb) === '[object Function]';
  }
  
  function Controller(){
    
    var vm = this,
        pageCb;
    
    if(!vm.options) throwError('options');
    
    pageCb = vm.options.callback;
    
    vm.actualPage = 1;
    vm.createPagination = createPagination;
    vm.changePage = changePage;
    
    function createPagination(totalItems, perPage) {
      var arr = [];
      for(var i = 1; i <= Math.ceil(totalItems/perPage); i++){
        arr.push(i);
      }
      return arr;
    }
    
    function changePage(pageIndex){
      vm.actualPage = pageIndex;
      if(isFunction(pageCb)){
        pageCb(vm.actualPage, vm.options.perPage);
      }
        
    }
    
  }
  
  
})(window, angular);