/**
* App.Controllers Module  
*
* function for all page
*
* Description
*/
angular.module('App.Controllers', [])

.run(function($rootScope) {
    $rootScope.typeOf = function(value) {
        return typeof value;
    };
})

.provider('AppManager', function () {
	
	this.$get = ['$rootScope', function($rootScope) {

		return {
			ConfirmBack: function($ionicPopup){
				$rootScope.GoBack = function(){ 
					$ionicPopup.confirm({
			      title: 'Confirm',
			      template: 'ต้องการออกจากหน้านี้?'
			    }).then(function(res) {
			      if (res) {
			        $rootScope.$ionicGoBack(); 
			      }
			    });
				};
			},

		}
	}];
})

.service('AppService', function($ionicLoading, $ionicPopup){
	return {
		err: function (str, err, isFocus){
			if(str)
				console.log(!str ? "alert " : "catch " +str+ " == ", err);

	    $ionicLoading.hide();
	    $ionicPopup.alert({
	      title: 'Error',
	      template: !str ? err : str + ' :: ' + err
	    }).then(function(err) {
	    	if(isFocus && err){
	    		$(document).ready(function () {
	          document.getElementById(isFocus).focus();
	          $('#'+isFocus).focus();
	     		});
	    	}
	    });
	  },
	  succ: function (succ, isFocus){
	    $ionicLoading.hide();
	    $ionicPopup.alert({
	      title: 'Success',
	      template: succ
	    }).then(function(suc) {
	    	if(isFocus && suc){
	    		$(document).ready(function () {
	          document.getElementById(isFocus).focus();
	          $('#'+isFocus).focus();
	     		});
	    	}
	    });
	  },
	  focus: function (id){
	  	$(document).ready(function () {
          document.getElementById(id).focus();
          $('#'+id).focus();
      });
	  },
	  findObjValue: function(Obj, Key, Value, isOptions){
        return $.grep(Obj, function(n, i){
            if(isOptions===false){
                return n[Key] != Value;
            }else{
                return n[Key] == Value;
            }
        });
    }
	};
})


.factory('App', function($soap, API) {
	return {
		API: function(action, params){
            console.log('action -> ',action);
            console.log('params -> ',params);
			return $soap.post(API.url, action, params?params:null);
		}
	};
})


/**
 * @ngdoc directive
 * @name isFocused
 * @module flynnBookScannerApp
 * @description gives focus the the element, can be used as attribute
 */
.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                // console.log('value=', value);
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
        }
    };
}])

.directive('uppercased', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform","uppercase");
        }
    };
})

.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
})


.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

;