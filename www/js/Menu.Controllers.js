
/**
* MainMenu.Controllers Module
*
* Description
*/

angular.module('Menu.Controllers', ['ionic'])

.controller('MenuCtrl', function($scope, $state, $ionicHistory, $stateParams, LoginService) {

	$scope.namePage = $stateParams.namePage;
	$scope.menuList = {};
	// var data = angular.copy(LoginService.getLoginData());

	switch($stateParams.menuPage){
		case 'app':
			console.log('data.Group_index==',angular.copy(LoginService.getLoginData('Group_index')));
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {MainMenu:'เมนูหลัก', Store:'Store', Production:'Production', Shipping:'Shipping', Additional:'เมนูเสริม', Pallet:'Pallet'};
					break;
				case '0010000000001':
				case '0010000000002': 
					/*BG*/
					$scope.menuList = {Production:'Production', Pallet:'Pallet'};
					break;
				case '0010000000004':
				case '0010000000005': 
				case '0010000000003': 
				case '0010000000093': 
				case '0010000000094': 
					/*WH*/
					$scope.menuList = {MainMenu:'เมนูหลัก', Shipping:'Shipping', Additional:'เมนูเสริม'};
					break;
				case '0010000000007':
				case '0010000000091': 
					/*rewmat*/
					$scope.menuList = {MainMenu:'เมนูหลัก', Additional:'เมนูเสริม'};
					break;
				case '0010000000008': 
					/*SH*/
					$scope.menuList = {MainMenu:'เมนูหลัก', Shipping:'Shipping', Additional:'เมนูเสริม'};
					break;
			}
			break;
		case 'MainMenu':
			$scope.menuList = {mainMenu_NewInUnwire:'NewIn, Unwire', mainMenu_NewInUnwireBP:'NewIn, Unwire BP', mainMenu_ProductGeneral:'รับสินค้าทั่วไป', mainMenu_UserCusReturn:'รับ User/Cus. Return', mainMenu_Rack:'เก็บเข้า Rack', mainmenu_PayProductGenaral:'จ่ายสินค้าทั่วไป'};
			break;
		case 'Store':
			// $scope.menuList = {store_SplitPallet:'แยก Pallet', store_CombinePallet:'รวม Pallet', store_MoveLocation:'ย้าย Location', store_ReceiveCoreToPallet:'รับแกนเข้า Pallet', store_ReceivingRawMatPackingChemical:'รับสินค้า RawMat, Packing, Chemical'};
			$scope.menuList = {store_SplitPallet:'แยก Pallet', store_CombinePallet:'รวม Pallet', store_MoveLocation:'ย้าย Location', store_ReceiveCoreToPallet:'รับแกนเข้า Pallet'};
			break;
		case 'Production':
			$scope.menuList = {production_PackingCore:'Packing Core', production_PackingRoll:'Packing Roll', production_PackToPallet:'Bag To Pallet', production_DeleteRoll:'Delete Roll', production_Stamp:'Production Stamp', production_RawMat:'รับสินค้า Raw mat', production_IssueRawMat:'Issue Raw mat'};
			break;
		case 'Shipping':
			$scope.menuList = {shipping_Sale:'เบิก Sale', shipping_NewInShipping:'รับสินค้า SH', shipping_CostomerReturn:'รับ Customer Return'};
			break;
		case 'Additional':
			$scope.menuList = {additional_SumRoll:'รวม Roll', additional_MovePallet:'ย้าย Pallet', additional_MoveLocation:'ย้าย Location', additional_CheckRollPallet:'Check Roll, Pallet', additional_CheckLocation:'Check Location'};
			break;
		case 'Pallet':
			$scope.menuList = {pallet_ClearPallet:'Clear Pallet'};
			break;
	}

	$scope.clickMenu = function(key, name){
		/*Menu page*/
		if($stateParams.menuPage == 'app')
			$state.go(key, {'menuPage':key, 'namePage':name});
		else
			$state.go(key);
	};

	$scope.GoBack = function(){ 
		$scope.$ionicGoBack(); 
	};

	

	
});




