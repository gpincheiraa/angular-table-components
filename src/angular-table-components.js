(function(window, angular, undefined){
  
  angular
    .module('gp.tableComponents',[])
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

/**
 * @ngdoc service
 * @name tableHelpers
 * @description
 * Utils functions to manage the table components directives
 */

  angular
    .module('gp.tableComponents')
    .service('tableHelpers', HelpersService);

  function HelpersService(){
    
    var self = this;

    self.throwError = throwError;
    self.isFunction = isFunction;

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
  }

  /**
   * @ngdoc directive
   * @name directive:gp-pagination
   * @element gp-pagination
   * @function
   *
   * @description
   * Creates a pagination using the bootstrap style and provide options
   * to configure the pagination behaviout
   * @example
    <div ng-controller="ExampleController as example">
      <gp-pagination options="example.paginationOptions"></gp-pagination>
    </div>
   */

  angular
    .module('gp.tableComponents')
    .provider('pagination', paginationProvider);
  
  function paginationProvider(){
    var cssString =
      '<style type="text/css">\
        ul.gp-pagination li{ \
          cursor: pointer; \
        }\
        ul.gp-pagination li.disabled{ \
          pointer-events: none; \
        }\
      </style>';
    this.$get = ['$interpolate',function($interpolate) {
      
      var interCss = $interpolate(cssString);
      document.head.insertAdjacentHTML("beforeend", interCss());
    
    }];
  }
  
  angular
    .module('gp.tableComponents')
    .directive('gpPagination', paginationDirective);
  
  paginationDirective.$inject = ['pagination', 'tableHelpers'];
  
  function paginationDirective(pagination, tableHelpers){
    var defaults = { perPage : 10 },
        ddo = {
          restrict: 'E',
          templateUrl: 'pagination.html',
          scope: {
            options : '='
          },
          bindToController: true,
          controller: PaginationController,
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
        tableHelpers.throwError('totalItems');
      }
    }
  }

  PaginationController.$inject = ['tableHelpers'];
  
  function PaginationController(tableHelpers){
    
    var vm = this,
        pageCb;
    
    if(!vm.options) tableHelpers.throwError('options');
    
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
      if(tableHelpers.isFunction(pageCb)){
        pageCb(vm.actualPage, vm.options.perPage);
      }
        
    }
  }

  /**
   * @ngdoc directive
   * @name directive:gp-sortable-columns
   * @element thead > tr
   * @description
   * Creates a pagination using the bootstrap style and provide options
   * to configure the pagination behaviout
   * @example
      <table class="table table-hover table-striped">
        <thead>
          <tr gp-sortable-columns>
            <th class="col-xs-4"> Column 1
              <i class="fa" gp-sortable="column1"></i>
            </th>
            <th class="col-xs-4"> Column 2
              <i class="fa" gp-sortable="column2"></i>
            </th>
          </tr>
        </thead>
      </table>
  */
  angular
    .module('gp.tableComponents')
    .provider('sortableOptions', sortableProvider);
  
  function sortableProvider(){

    var cssString =
      '<style type="text/css">\
        *[gp-sortable]{ \
          cursor: pointer; \
        }\
      </style>';

    var _directionAscClassname  = 'fa-sort-asc',
        _directionDescClassname = 'fa-sort-desc';

    this.setAscClassname = function(_classname){
      _directionAscClassname = _classname;
    };

    this.setDescClassname = function(_classname){
      _directionDescClassname = _classname;
    };
    
    this.$get = ['$interpolate',function($interpolate) {
      
      document.head.insertAdjacentHTML("beforeend", $interpolate(cssString)());

      return {
        classNames : {
          directionAsc  : _directionAscClassname,
          directionDesc : _directionDescClassname
        }
      };

    }];
  }

  angular
    .module('gp.tableComponents')
    .directive('gpSortableColumns', sortableColumnsDirective);
  
  function sortableColumnsDirective(){
    var ddo = {
      restrict: 'A',
      scope: {
        callback : '=?'
      },
      bindToController: true,
      controller: SortableColumnsController,
      controllerAs: 'vm'
    };
    return ddo;
  }

  SortableColumnsController.$inject = ['$rootScope'];
  
  function SortableColumnsController($rootScope){
    var vm = this;
    
    vm.updateSortables = function(_scope){
      $rootScope.$broadcast('sortable:update', _scope.$id);
    };
  }

  angular
    .module('gp.tableComponents')
    .directive('gpSortable', sortable);

  sortable.$inject = ['sortableOptions', 'tableHelpers'];

  function sortable(sortableOptions, tableHelpers){
    var ddo = {
      restrict: 'A',
      require: '^gpSortableColumns',
      scope: {},
      link: linkFn
    };
    return ddo;

    function linkFn(scope, element, attributes, sortableColumnsCtrl){
      
      var sortableColumn = attributes.gpSortable,
          ascClass  = sortableOptions.classNames.directionAsc,
          descClass = sortableOptions.classNames.directionDesc;

      scope.desc = true;

      element.addClass(descClass);
      element.bind('click', sortableColumnsCtrl.updateSortables.bind(null, scope));

      scope.$on('sortable:update', function(e, scopeId){
        
        if(scope.$id !== scopeId){
          scope.desc = true;
        }
        else{
          scope.desc = !scope.desc;
          
          if(tableHelpers.isFunction(sortableColumnsCtrl.callback)){
            sortableColumnsCtrl.callback(sortableColumn , scope.desc? 'desc' : 'asc');
          }
        }
        element.removeClass(scope.desc? ascClass : descClass);
        element.addClass(scope.desc? descClass : ascClass);

      });

    }
  }


})(window, angular);