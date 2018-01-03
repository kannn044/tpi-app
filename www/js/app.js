// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'angularSoap', 'angular-md5', 'LocalStorageModule', 'App.Controllers', 
  'Login.Controllers', 'Login.Services', 'Menu.Controllers', 'Menu_MainMenu.Controllers', 'Menu_MainMenu.Services',
  'Store.Controllers', 'Production.Controllers', 'Shipping.Controllers', 'Additional.Controllers', 'Pallet.Controllers'])

/*test*/
// .constant('API', {
//     url: 'http://authorwise.co.th/tpipl/Business_Layer.asmx'
// })

.constant('API', {
    url: 'http://192.168.23.60/WMS_TEST/Business_Layer.asmx'
})

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="lines" class="spinner-positive"></ion-spinner>'
})

.run(function($ionicPlatform, $state, $ionicHistory, AppManager, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      // window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      // StatusBar.overlaysWebView(false);
      StatusBar.backgroundColorByHexString("#51f5bc");
      // StatusBar.styleDefault();
    }
    
    AppManager.ConfirmBack($ionicPopup);

  });



  $ionicPlatform.registerBackButtonAction(function(event) {
      console.log('$state.current.name = ',$state.current.name);
      if ($state.current.name == "login") { // your check here
        /*$ionicPopup.confirm({
            title: 'System warning',
            template: 'are you sure you want to exit?'
        }).then(function(res) {
            if (res) {
                ionic.Platform.exitApp();
            }
        });*/
        ionic.Platform.exitApp();
      } else if($state.current.name == "mainMenu_NewInUnwire" || 
        $state.current.name == "mainMenu_NewInUnwireBP" || $state.current.name == "mainMenu_NewInUnwireBP_Selected" ||
        $state.current.name == "mainMenu_ProductGeneral" || $state.current.name == "mainMenu_ProductGeneral_Selected" ||
        $state.current.name == "mainMenu_UserCusReturn" || $state.current.name == "mainMenu_Rack" || 
        $state.current.name == "mainmenu_PayProductGenaral" || $state.current.name == "store_SplitPallet" || 
        $state.current.name == "store_CombinePallet" || $state.current.name == "store_MoveLocation" || 
        $state.current.name == "store_ReceiveCoreToPallet" || $state.current.name == "store_ReceiveCoreToPallet_Selected" || 
        $state.current.name == "store_ReceivingRawMatPackingChemical" || $state.current.name == "store_ReceivingRawMatPackingChemical_Selected" ||
        $state.current.name == "production_PackingCore" || $state.current.name == "production_PackingRoll" || 
        $state.current.name == "production_PackToPallet" || $state.current.name == "production_DeleteRoll" || 
        $state.current.name == "production_Stamp" ||
        $state.current.name == "production_RawMat" || $state.current.name == "production_RawMat_Selected" ||
        $state.current.name == "production_IssueRawMat" || $state.current.name == "shipping_Sale" || 
        $state.current.name == "shipping_NewInShipping" || $state.current.name == "shipping_CostomerReturn" || 
        $state.current.name == "additional_SumRoll" || $state.current.name == "additional_MovePallet" || 
        $state.current.name == "additional_MoveLocation" || $state.current.name == "additional_CheckRollPallet" || 
        $state.current.name == "additional_CheckLocation" || $state.current.name == "pallet_ClearPallet") {
        
        $ionicPopup.confirm({
          title: 'Confirm',
          template: 'ต้องการออกจากหน้านี้?'
        }).then(function(res) {
          
          if (res) {
            $scope.$ionicGoBack(); 
          }
        });

      } else {
        $ionicHistory.goBack();
      }

  }, 100);
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/Login.html',
      controller: 'LoginCtrl'
    })

    /*Main menu*/
    .state('app', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    /*Menu Main menu*/
    .state('MainMenu', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('mainMenu_NewInUnwire', {
      url: '/Menu_NewInUnwire',
      templateUrl: 'templates/Menu_NewInUnwire.html',
      controller: 'Menu_NewInUnwireCtrl'
    })

    .state('mainMenu_NewInUnwireBP', {
      url: '/Menu_NewInUnwireBP',
      templateUrl: 'templates/Menu_NewInUnwireBP.html',
      controller: 'Menu_NewInUnwireBPCtrl'
    })

    .state('mainMenu_NewInUnwireBP_Selected', {
      url: '/mainMenu_NewInUnwireBP_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Menu_NewInUnwireBP_Selected.html',
      controller: 'Menu_NewInUnwireBP_SelectedCtrl'
    })

    .state('mainMenu_ProductGeneral', {
      url: '/Menu_ProductGeneral',
      templateUrl: 'templates/Menu_ProductGeneral.html',
      controller: 'Menu_ProductGeneralCtrl'
    })

    .state('mainMenu_ProductGeneral_Selected', {
      url: '/Menu_ProductGeneral_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Menu_ProductGeneral_Selected.html',
      controller: 'Menu_ProductGeneral_SelectedCtrl'
    })

    .state('mainMenu_UserCusReturn', {
      url: '/Menu_UserCusReturn',
      templateUrl: 'templates/Menu_UserCusReturn.html',
      controller: 'Menu_UserCusReturnCtrl'
    })

    .state('mainMenu_Rack', {
      url: '/Menu_Rack',
      templateUrl: 'templates/Menu_Rack.html',
      controller: 'Menu_RackCtrl'
    })

    .state('mainmenu_PayProductGenaral', {
      url: '/Menu_PayProductGenaral',
      templateUrl: 'templates/Menu_PayProductGenaral.html',
      controller: 'Menu_PayProductGenaralCtrl'
    })

    /*Menu Store*/
    .state('Store', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('store_SplitPallet', {
      url: '/Store_SplitPallet',
      templateUrl: 'templates/Store_SplitPallet.html',
      controller: 'Store_SplitPalletCtrl'
    })

    .state('store_CombinePallet', {
      url: '/Store_CombinePallet',
      templateUrl: 'templates/Store_CombinePallet.html',
      controller: 'Store_CombinePalletCtrl'
    })

    .state('store_MoveLocation', {
      url: '/Store_MoveLocation',
      templateUrl: 'templates/Store_MoveLocation.html',
      controller: 'Store_MoveLocationCtrl'
    })

    .state('store_ReceiveCoreToPallet', {
      url: '/Store_ReceiveCoreToPallet',
      templateUrl: 'templates/Store_ReceiveCoreToPallet.html',
      controller: 'Store_ReceiveCoreToPalletCtrl'
    })

    .state('store_ReceiveCoreToPallet_Selected', {
      url: '/Store_ReceiveCoreToPallet_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Store_ReceiveCoreToPallet_Selected.html',
      controller: 'Store_ReceiveCoreToPallet_SelectedCtrl'
    })

    .state('store_ReceivingRawMatPackingChemical', {
      url: '/Store_ReceivingRawMatPackingChemical',
      templateUrl: 'templates/Store_ReceivingRawMatPackingChemical.html',
      controller: 'Store_ReceivingRawMatPackingChemicalCtrl'
    })

    .state('store_ReceivingRawMatPackingChemical_Selected', {
      url: '/Store_ReceivingRawMatPackingChemical_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Store_ReceivingRawMatPackingChemical_Selected.html',
      controller: 'Store_ReceivingRawMatPackingChemical_SelectedCtrl'
    })

    /*Menu Production*/
    .state('Production', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('production_PackingCore', {
      url: '/Production_PackingCore',
      templateUrl: 'templates/Production_PackingCore.html',
      controller: 'Production_PackingCoreCtrl'
    })

    .state('production_PackingRoll', {
      url: '/Production_PackingRoll',
      templateUrl: 'templates/Production_PackingRoll.html',
      controller: 'Production_PackingRollCtrl'
    })

    .state('production_PackToPallet', {
      url: '/Production_PackToPallet',
      templateUrl: 'templates/Production_PackToPallet.html',
      controller: 'Production_PackToPalletCtrl'
    })

    .state('production_DeleteRoll', {
      url: '/Production_DeleteRoll',
      templateUrl: 'templates/Production_DeleteRoll.html',
      controller: 'Production_DeleteRollCtrl'
    })

    .state('production_Stamp', {
      url: '/Production_Stamp',
      templateUrl: 'templates/Production_Stamp.html',
      controller: 'Production_StampCtrl'
    })

    .state('production_RawMat', {
      url: '/Production_RawMat',
      templateUrl: 'templates/Production_RawMat.html',
      controller: 'Production_RawMatCtrl'
    })

    .state('production_RawMat_Selected', {
      url: '/Production_RawMat_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Production_RawMat_Selected.html',
      controller: 'Production_RawMat_SelectedCtrl'
    })

    .state('production_IssueRawMat', {
      url: '/Production_IssueRawMat',
      templateUrl: 'templates/Production_IssueRawMat.html',
      controller: 'Production_IssueRawMatCtrl'
    })

    /*Menu Shipping*/
    .state('Shipping', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('shipping_Sale', {
      url: '/Shipping_Sale',
      templateUrl: 'templates/Shipping_Sale.html',
      controller: 'Shipping_SaleCtrl'
    })

    .state('shipping_NewInShipping', {
      url: '/Shipping_NewInShipping',
      templateUrl: 'templates/Shipping_NewInShipping.html',
      controller: 'Shipping_NewInShippingCtrl'
    })

    .state('shipping_CostomerReturn', {
      url: '/Shipping_CostomerReturn',
      templateUrl: 'templates/Shipping_CostomerReturn.html',
      controller: 'Shipping_CustomerReturnCtrl'
    })

    /*Menu Additional*/
    .state('Additional', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('additional_SumRoll', {
      url: '/Additional_SumRoll',
      templateUrl: 'templates/Additional_SumRoll.html',
      controller: 'Additional_SumRollCtrl'
    })

    .state('additional_MovePallet', {
      url: '/Additional_MovePallet',
      templateUrl: 'templates/Additional_MovePallet.html',
      controller: 'Additional_MovePalletCtrl'
    })

    .state('additional_MoveLocation', {
      url: '/Additional_MoveLocation',
      templateUrl: 'templates/Additional_MoveLocation.html',
      controller: 'Additional_MoveLocationCtrl'
    })

    .state('additional_CheckRollPallet', {
      url: '/Additional_CheckRollPallet',
      templateUrl: 'templates/Additional_CheckRollPallet.html',
      controller: 'Additional_CheckRollPalletCtrl'
    })

    .state('additional_CheckLocation', {
      url: '/Additional_CheckLocation',
      templateUrl: 'templates/Additional_CheckLocation.html',
      controller: 'Additional_CheckLocationCtrl'
    })

    /*Menu Pallet*/
    .state('Pallet', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('pallet_ClearPallet', {
      url: '/Pallet_ClearPallet',
      templateUrl: 'templates/Pallet_ClearPallet.html',
      controller: 'Pallet_ClearPalletCtrl'
    })

  $urlRouterProvider.otherwise('/login');
})


