/**
 * Pallet.Controllers Module
 *
 * Description
 */
angular.module('Pallet.Controllers', [])

.controller('Pallet_ClearPalletCtrl', function($scope, $state, $ionicPopup, $cordovaBarcodeScanner, AppService, LoginService, App, $ionicLoading) {

    $scope.data = {};
    $scope.dataTableItem = [];
    $scope.dataTableItem.length = 0;

    /*--------------------------------------
    Set Focus Function
    ------------------------------------- */
    var setFocus = function(){
        $scope.data.PalletBarcode = null;
        AppService.focus('input-PalletNoBar');
    };


    /*--------------------------------------
    Set Selected Function
    ------------------------------------- */
    $scope.setSelected = function(index) {
        if($scope.dataTableItem[index].isSelect)
            $scope.dataTableItem[index].isSelect = false;
        else
            $scope.dataTableItem[index].isSelect = true;
    };


    /*--------------------------------------
    Deleted Function
    ------------------------------------- */
    $scope.deleted = function(){
        if(AppService.findObjValue($scope.dataTableItem, 'isSelect', true, true).length <= 0){
            AppService.err('', 'ไม่มีรายการที่เลือก');
        }else{
            for(var i in $scope.dataTableItem){
                if($scope.dataTableItem[i].isSelect)
                    $scope.dataTableItem.splice(i, 1);
            }
        }
    };


    /*--------------------------------------
    Search Pallet Function
    ------------------------------------- */
    $scope.searchPallet = function(){
        
        if(!$scope.data.PalletBarcode){
            AppService.err('', 'กรุณาเลือก Pallet No.', 'input-PalletNoBar'); //popup error and focus
        }else if($scope.data.PalletBarcode && $scope.dataTableItem.length > 0 && AppService.findObjValue($scope.dataTableItem, 'Pallet_No', $scope.data.PalletBarcode, true).length > 0){

            $scope.data.PalletBarcode = null;
            AppService.err('', 'เลือก Pallet No. นี้ไปแล้ว', 'input-PalletNoBar');

        }else{

            $ionicLoading.show();
            App.API('getPallet_No', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: $scope.data.PalletBarcode.toUpperCase()
            }).then(function(res){
                console.log('res = ',res);
                var data = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                if(Object.keys(data).length > 0){

                    App.API('getTagByPallet', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: $scope.data.PalletBarcode.toUpperCase()
                    }).then(function(res){
                        console.log('res = ',res);
                        var obj = JSON.parse(res);
                        //var dataTag = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        var dataTag = obj.Table1;
                        if(dataTag.length > 0){

                            $ionicLoading.hide();
                            $ionicPopup.confirm({
                                title: 'Confirm',
                                template: 'Pallet นี้ กำลังใช้งาน จะดำเนินการต่อหรือไม่ ?'
                              }).then(function(res) {
                                if(!res){
                                    setFocus();
                                }
                                else{
                                    $scope.dataTableItem.push({Pallet_No: $scope.data.PalletBarcode.toUpperCase(), isSelect: false});
                                    setFocus();
                                }
                            });

                        }else{
                            AppService.err('', 'ไม่พบ Pallet นี้ ในระบบ', 'input-PalletNoBar');
                            setFocus();
                        }

                    }).catch(function(res){
                        AppService.err('getTagByPallet', res);
                    }).finally(function(){
                        $ionicLoading.hide();
                    }); // End Call API getTagByPallet

                }else{
                    AppService.err('', 'ไม่พบ Pallet นี้ ในระบบ', 'input-PalletNoBar');
                    setFocus();
                }

            }).catch(function(res){
                AppService.err('getPallet_No', res);
            }).finally(function(){
            }); //End Call API getPallet_No

        }
        
    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){
       
        if($scope.data.countRow <= 0){
            AppService.err('', 'ไม่มีรายการ Pallet No.', 'input-PalletNoBar');
            setFocus();
        }else{
            $ionicLoading.show();

            var items = [];
            angular.forEach($scope.dataTableItem, function(value, key) {
                var item = {
                    "Seq": (key+1).toString(), 
                    "Pallet_No": value.Pallet_No
                }
                this.push(item);
            }, items);
            var ads = { 
                "Table1": items
            };

            App.API('Clear_Pallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                ads: JSON.stringify(ads),
            }).then(function(res){
                console.log('res = ',res);  
                if(res == 'True'){
                    $scope.data = {};
                    $scope.dataTableItem = [];
                    $scope.dataTableItem.length = 0;
                }
                AppService.err('succ :: ', res);             
            }).catch(function(res){
                AppService.err('Clear_Pallet', res);
            }).finally(function(){
                $ionicLoading.hide();
            });
            // $ionicLoading.hide();
            
        }

    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.searchPallet();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };

});
