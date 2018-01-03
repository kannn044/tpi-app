/**
 * Store.Controllers Module
 *
 * Description
 */
angular.module('Store.Controllers', ['ionic'])

.controller('Store_SplitPalletCtrl', function($scope, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    $scope.data = {};
    $scope.dataTagItem = {};

    /*--------------------------------------
    Change TagNo Function
    ------------------------------------- */
    $scope.changeTagNo = function(dataTagNo){
        console.log('dataTagNo value = ',dataTagNo);
        if(dataTagNo){
            //var parseTag = JSON.parse(item);
            var parseTag = dataTagNo[0];
            var totalQty = parseInt(parseTag.Qty_Bal);
            $scope.data.SkuId = parseTag.Sku_Id;
            $scope.data.PalletStatus = parseTag.Pallet_Status;
            $scope.data.LotNo = parseTag.PLot;
            $scope.data.KG = totalQty;
            $scope.data.BAG = parseInt(parseTag.Qty_per_TAG);
            $scope.data.QtyMove = totalQty
            $scope.data.Tag_No = parseTag.TAG_No;
            $scope.data.ItemStatus_Index_Bal = parseTag.ItemStatus_Index_Bal;
            $scope.data.Str1 = parseTag.Str1;

            $scope.data.QtyAfterMove = $scope.data.KG - $scope.data.QtyMove;

            AppService.focus('pallet-end');
        }

    };

    /*--------------------------------------
    tagNo Function
    ------------------------------------- */
    var tagNo = function(PalletNo){
        App.API('getPalletTagBalance', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pPallet_No: PalletNo 
        }).then(function(res) {
            var dataTagItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',dataTagItem);
            
            if(Object.keys(dataTagItem).length > 0){
                $scope.dataTagItem = dataTagItem;
                $scope.changeTagNo($scope.dataTagItem);
            }else{
                // $scope.data.TagNo = null;
                $scope.data.Str1 = null;
                $scope.dataTagItem = {};
            }

        }).catch(function(res) {
            AppService.err('getPalletTagBalance', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    Save Relocate Function
    ------------------------------------- */
    var saveRelocate = function(){
        $ionicLoading.show();
        App.API('saveRelocate_SplitPallet_NewByPakorn', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            OldTag_No: $scope.data.Tag_No, 
            NewPallet_No: $scope.data.PalletEnd, 
            OldPallet_No: $scope.data.PalletStart, 
            dblQtyMove: $scope.data.QtyMove, 
            dblQtyAfterMove: $scope.data.QtyAfterMove, 
            pstrNewPalletStatus_Index: $scope.data.ItemStatus_Index_Bal, 
        }).then(function(res) {
            console.log('res = ',res);
            if(res == 'True'){
                $scope.data = {};
                $scope.dataTagItem = {};
                AppService.succ('ทำการแตกพาเลทสินค้าเรียบร้อย', 'pallet-start');
            }else{
                $scope.data.PalletEnd = null;
                AppService.succ('Lot ไม่ตรงกัน', 'pallet-end');
            }

        }).catch(function(res) {
            AppService.err('saveRelocate_SplitPallet_NewByPakorn', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };



    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(data){

        if(!data.PalletStart)
            AppService.err('', 'กรุณาป้อน Pallet No. ต้นทาง!', 'pallet-start');
        else if(!data.PalletEnd)
            AppService.err('', 'กรุณาป้อน Pallet No. ปลายทาง!', 'pallet-end');
        else if(!data.QtyMove || data.QtyMove == 0)
            AppService.err('', 'กรุณาป้อนจำนวนย้าย! มากกว่า 0', 'qty-move');
        else
            saveRelocate();

    };



    /*--------------------------------------
    Search Pallete Function
    ------------------------------------- */
    $scope.searchPallet = function(PalletNo, Position) {

        if(!PalletNo){
            AppService.err('', 'กรุณาใส่ Pallet', (Position=='Start') ? 'pallet-start' : 'pallet-end');
        }else{
            $ionicLoading.show();
            App.API('getPallet_No', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pPallet_No: PalletNo 
            }).then(function(res) {

                var dataPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',dataPallet);
                if(Object.keys(dataPallet).length > 0){

                    App.API('getBalancePallet_No', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pPallet_No: PalletNo 
                    }).then(function(res) {

                        var dataPallet2 = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',dataPallet2);

                        var PalletStatus_Index = (Position=='Start') ? '0010000000004' : '0010000000000';

                        if(dataPallet[0].PalletStatus_Index == PalletStatus_Index){
                            console.log('Position = ',Position);
                            if(Position == 'Start'){
                                tagNo(PalletNo);
                            }
                            if(Position == 'End'){
                                $scope.save(angular.copy($scope.data));
                            }
                        }else{
                            $scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'] = null;
                            var msg = (Position=='Start') ? 'สถานะ Pallet ไม่เป็น RD' : 'สถานะ Pallet ไม่เป็น EM';
                            AppService.err('', msg, (Position=='Start') ? 'pallet-start' : 'pallet-end');
                        }

                    }).catch(function(res) {
                        AppService.err('getBalancePallet_No', res);
                    }).finally(function(res) {
                        
                    }); //End Call API getBalancePallet_No

                }else{
                    $ionicLoading.hide();
                    $scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'] = null;
                    var msg3 = (Position=='Start') ? 'ไม่พบสินค้าที่ระบุ !' : 'ไม่พบ Pallet ปลายทางที่ระบุ !';
                    AppService.err('', msg3, (Position=='Start') ? 'pallet-start' : 'pallet-end');
                }

            }).catch(function(res) {
                AppService.err('getPallet_No', res);
            }).finally(function(res) {
            }); // End Call API getPallet_No

        }

    };


    /*--------------------------------------
    Change QtyMove Function
    ------------------------------------- */
    $scope.changeQtyMove = function(QtyMove){
        $scope.data.QtyAfterMove = $scope.data.KG - QtyMove;
        if($scope.data.QtyAfterMove < 0){
            AppService.err('', 'กรุณาป้อนจำนวนย้าย! มากกว่า จำนวนเต็ม ', 'qty-move');
            $scope.data.QtyMove = "";
        }
    };


    /*--------------------------------------
    Search Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'] = imageData.text.toUpperCase();
                $scope.searchPallet($scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'], Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})


.controller('Store_CombinePalletCtrl', function($scope, $state, $cordovaBarcodeScanner, $ionicLoading, App, AppService, LoginService) {

    $scope.data = {};
    $scope.dataTagItem1 = {};
    $scope.dataTagItem2 = {};



    /*--------------------------------------
    Change TagNo Function
    ------------------------------------- */
    $scope.changeTagNo = function(dataTagNo){
        console.log('changeTagNo value = ',dataTagNo);
        if(dataTagNo){
            // var parseTag = JSON.parse(dataTagNo);
            var parseTag = dataTagNo[0];
            var totalQty = parseInt(parseTag.Qty_Bal);
            $scope.data.SkuId = parseTag.Sku_Id;
            $scope.data.PalletStatus = parseTag.Pallet_Status;
            $scope.data.LotNo = parseTag.PLot;
            $scope.data.KG = totalQty;
            $scope.data.BAG = parseInt(parseTag.Qty_per_TAG) / parseInt(parseTag.Flo1_T);
            $scope.data.QtyMove = totalQty
            $scope.data.Tag_No = parseTag.TAG_No;
            $scope.data.ItemStatus_Index_Bal = parseTag.ItemStatus_Index_Bal;
            $scope.data.Str1 = parseTag.Str1;

            $scope.data.QtyAfterMove = $scope.data.KG - $scope.data.QtyMove;
            AppService.focus('pallet-end');

        }

    };


    /*--------------------------------------
    Search Pallet Function
    ------------------------------------- */
    $scope.searchPallet = function(PalletNo, Position) {

        if(!PalletNo){
            AppService.err('', 'กรุณาใส่ Pallet', (Position=='Start') ? 'pallet-start' : 'pallet-end');
        }else{

            $ionicLoading.show();
            App.API('getPalletTagBalance', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pPallet_No: PalletNo 
            }).then(function(res) {

                var dataTagItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                $scope[(Position=='Start') ? 'dataTagItem1' : 'dataTagItem2'] = dataTagItem;

                if($scope.dataTagItem1){
                    $scope.changeTagNo($scope.dataTagItem1);
                }
                    
            }).catch(function(res) {
                AppService.err('getPalletTagBalance', res);
            }).finally(function(res) {
                $ionicLoading.hide();
            });

        }

    };


    /*--------------------------------------
    Change QtyMove Function
    ------------------------------------- */
    $scope.changeQtyMove = function(QtyMove){
        $scope.data.QtyAfterMove = $scope.data.KG - QtyMove;
        if($scope.data.QtyAfterMove < 0){
            AppService.err('', 'กรุณาป้อนจำนวนย้าย! มากกว่า จำนวนเต็ม ', 'qty-move');
            $scope.data.QtyMove = "";
        }
    };


    /*--------------------------------------
    Save Relocate Function
    ------------------------------------- */
    var saveRelocate = function(){
        $ionicLoading.show();
        App.API('saveRelocate_CombinePallet_NewByPakorn', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            OldTag_No: $scope.dataTagItem1[0].TAG_No, 
            OldTag_No2: $scope.dataTagItem2[0].TAG_No, 
            NewPallet_No: $scope.data.PalletEnd, 
            OldPallet_No: $scope.data.PalletStart, 
            dblQtyMove: $scope.data.QtyMove, 
            dblQtyAfterMove: $scope.data.QtyAfterMove, 
            pstrNewPalletStatus_Index: $scope.data.ItemStatus_Index_Bal, 
        }).then(function(res) {
            console.log('res = ',res);
            if(res == 'True'){
                $scope.data = {};
                $scope.dataTagItem1 = {};
                $scope.dataTagItem2 = {};
                AppService.succ('ทำการรวมพาเลทสินค้าเรียบร้อย', 'pallet-start');
            }else{
                $scope.data.PalletEnd = null;
                $scope.dataTagItem2 = {};
                AppService.succ('Grade หรือ Lot ไม่ตรงกัน', 'pallet-end');
            }

        }).catch(function(res) {
            AppService.err('saveRelocate_CombinePallet_NewByPakorn', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(data){
        
        if(!data.PalletStart){
            AppService.err('', 'กรุณาป้อน Pallet No. ต้นทาง!', 'pallet-start');
        }else if(!data.PalletEnd){
            AppService.err('', 'ไม่พบ Pallet นี้ !', 'pallet-end');
        }else if(data.PalletStart == data.PalletEnd){
            $scope.data.PalletEnd = null;
            $scope.dataTagItem2 = {};
            AppService.err('', 'Tag Pallet ต้นทางกับปลายทางซ้ำกัน !', 'pallet-end');
        }else{
            saveRelocate();
        }

    };


    /*--------------------------------------
    Search Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'] = imageData.text.toUpperCase();
                $scope.searchPallet($scope.data[(Position=='Start') ? 'PalletStart' : 'PalletEnd'], Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})


.controller('Store_MoveLocationCtrl', function($scope, $ionicPopup, $filter, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {
  
  	$scope.data = {};
  	$scope.GetStatusItem = {};
  	$scope.GetStatusItem.length = 0;  	
  	$scope.GetStatusPallet = {};
  	$scope.GetStatusPallet.length = 0;


    /*--------------------------------------
    Call API GetStatusPallet
    ------------------------------------- */
    $scope.GetStatusPallet_API = function(){
        App.API('GetStatusPallet', { 
            objsession: angular.copy(LoginService.getLoginData())
        }).then(function(resS) {
            $scope.GetStatusPallet = (!resS['diffgr:diffgram']) ? {} : resS['diffgr:diffgram'].NewDataSet.Table1;
            $scope.GetStatusPallet.length = Object.keys($scope.GetStatusPallet).length;
        }).catch(function(resS) {
            AppService.err('GetStatusPallet', resS);
        }).finally(function(res) {       
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    Call API GetStatusItem
    ------------------------------------- */
    $scope.GetStatusItem_API = function(){
        $ionicLoading.show();
        App.API('GetStatusItem', { 
            objsession: angular.copy(LoginService.getLoginData())
        }).then(function(res) {
            $scope.GetStatusItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.GetStatusItem.length = Object.keys($scope.GetStatusItem).length;
        }).catch(function(res) {
            AppService.err('GetStatusItem', res);
        }).finally(function(res) {
            $scope.GetStatusPallet_API();
        });
    };
    $scope.GetStatusItem_API();
  

    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataSearch){

    	if(!dataSearch){
			AppService.err('', 'กรุณาป้อน Pallet', 'Pallet');
		}else{

			$ionicLoading.show();
			App.API('getPalletTagBalance', { 
	  			objsession: angular.copy(LoginService.getLoginData()),
	  			pPallet_No: dataSearch
		  	}).then(function(res) {

		        var dataPalletTag = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
				console.log('res = ',dataPalletTag);
		        if(Object.keys(dataPalletTag).length <= 0){
		        	$scope.data.Pallet = null;
		        	AppService.err('', 'ไม่พบ Pallet นี้ หรือ Pallet นี้ไม่มีสินค้า!', 'Pallet');
		        }else{

		        	$scope.data.Product = dataPalletTag[0].Sku_Id;
		        	$scope.data.Lot = dataPalletTag[0].Plot;
		        	$scope.data.OrderDate = $filter('date')(dataPalletTag[0].Order_Date, 'dd/MM/yyyy');
		        	$scope.data.OrderNo = dataPalletTag[0].Order_No;
		        	$scope.data.StatusItem = dataPalletTag[0].ItemStatus_Index;
		        	$scope.data.PalletStatusId = dataPalletTag[0].PalletStatus_Id;
		        	$scope.data.PalletStatus = dataPalletTag[0].PalletStatus_Index;
		        	$scope.data.RefNo1 = dataPalletTag[0].Ref_No1;
		        	$scope.data.Warehouse = dataPalletTag[0].Warehouse;
		        	$scope.data.LocationAliasReally = dataPalletTag[0].Location_Alias_Really;

		        	App.API('getTag_Sum', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pOrder_Index: dataPalletTag[0].Order_Index,
                        Pallet_No: dataSearch,
                    }).then(function(resTag) {                                       

                        var getTag_Sum = (!resTag['diffgr:diffgram']) ? {} : resTag['diffgr:diffgram'].NewDataSet.Table1[0];
                        if (Object.keys(getTag_Sum).length > 0 ) {
                            $scope.data.TotalRoll = getTag_Sum.Count_Tag;
                            $scope.data.Weight = parseFloat(getTag_Sum.Weight_Tag).toFixed(4);
                            $scope.data.Length = getTag_Sum.Qty_Tag;
                        }
                    }).catch(function(resTag) {
                        AppService.err('getTag_Sum', resTag);
                    }).finally(function(res) {
                    	$ionicLoading.hide();
                    	AppService.focus('MoveTo');
                    });
                                	
		        }

		    }).catch(function(res) {
		        AppService.err('getPalletTagBalance', res);
		    }).finally(function(res) {       
		        $ionicLoading.hide();
		    });

		}   

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(dataArr){

    	if(!dataArr.Pallet){
			AppService.err('', 'กรุณาป้อน Pallet', 'Pallet');
		}else if(!dataArr.MoveTo){
			AppService.err('', 'กรุณาป้อนตำแหน่งจัดเก็บ', 'MoveTo');
		}else{

			$ionicLoading.show();
		  	App.API('GetLocation_Index', { 
		  		objsession: angular.copy(LoginService.getLoginData()),
		  		pstrLocation: dataArr.MoveTo
		  	}).then(function(resLocation) {
		        console.log('res = ',resLocation);
		        if(!resLocation){
		        	$scope.data.MoveTo = null;
		        	AppService.err('', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!"', 'MoveTo');
		        }else{

                    App.API('saveRelocateONLY_Pallet', { 
                        objsession: angular.copy(LoginService.getLoginData()),
                        NewPallet_No: dataArr.Pallet,
                        dblQtyMove: dataArr.Weight,
                        pstrNewLocation_Ailas: dataArr.MoveTo,
                        pstrNewItemStatus_Index: dataArr.StatusItem,
                        pstrNewPalletStatus_Index: dataArr.PalletStatus
                    }).then(function(resSave) {
                        console.log('res = ',resSave);
                        if(resSave == 'True'){
                            $scope.data = {};
                            $scope.data.StatusItem = '';
                            $scope.data.PalletStatus = '';
                            $ionicLoading.hide();
                            AppService.succ('ย้ายเรียบร้อย', 'Pallet');
                        }else{
                            $scope.data.Pallet = null;
                            $ionicLoading.hide();
                            AppService.err('', 'ไม่สามาถย้ายได้', 'Pallet');
                        }
                    }).catch(function(resSave) {
                        AppService.err('saveRelocateONLY_Pallet', resSave);
                    }).finally(function(res) {       
                    });

		        }
		       
		    }).catch(function(resLocation) {
		        AppService.err('GetLocation_Index', resLocation);
		    }).finally(function(res) {       
		    });

		}

    };


    /*--------------------------------------
    Scan Barcodet Function
    ------------------------------------- */
  	$scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[Position] = imageData.text.toUpperCase();
                if(Position == 'Pallet')
                	$scope.search($scope.data[Position]);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


  
})

.controller('Store_ReceiveCoreToPalletCtrl', function($ionicLoading, $scope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {

    $scope.IndexSelected = null;
    $scope.NoSelected = null;
    $scope.orderTopicList = null;
    $ionicLoading.show();


    /*--------------------------------------
    Selected Function
    ------------------------------------- */
    $scope.selected = function(IndexSelected, NoSelected) {
        if (!IndexSelected) {
            AppService.err('', 'ยังไม่ได้เลือกรายการ');
        } else {
            $state.go('store_ReceiveCoreToPallet_Selected', { Order_Index: IndexSelected, Order_No: NoSelected });
        }
    };


    /*--------------------------------------
    Set Selected Function
    ------------------------------------- */
    $scope.setSelected = function(OrderIndex, OrderNo) {
        $scope.IndexSelected = OrderIndex;
        $scope.NoSelected = OrderNo;
    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){
        App.API('GetOrderTopic', {
            objsession: angular.copy(LoginService.getLoginData()),
            // pstrWhere: "And (ms_DocumentType.DocumentType_Index not IN ('0010000000002','0010000000044')) " +
            //     "AND tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer " +
            //     "  where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)"
            pstrWhere: ""
        }).then(function(res) {
            var orderTopicList = (!res['diffgr:diffgram']) ? null : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.orderTopicList = orderTopicList;
            $scope.orderTopicList.length = (orderTopicList) ? Object.keys(orderTopicList).length : 0;
        }).catch(function(res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function() {
            $ionicLoading.hide();       
        });
    };
    $scope.GetOrderTopic_API();
    

})


.controller('Store_ReceiveCoreToPallet_SelectedCtrl', function($scope, $state, $stateParams, $ionicLoading, $cordovaBarcodeScanner, AppService, App, LoginService) {

    $scope.data = {};
    var Order_Index = $stateParams.Order_Index;
    var Order_No = $scope.data.OrderNo = $stateParams.Order_No;
    $scope.dataGridView = {};
    $scope.dataGridView.length = 0;
    var isError = false;


    /*--------------------------------------
    Load Form Function
    ------------------------------------- */
    var loadForm = function() {
        $ionicLoading.show();
        App.API('getTag_Receive', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {

            var dataTAG = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            if(Object.keys(dataTAG).length > 0){

                App.API('getGridView_STRC', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pstrorder_index: Order_Index
                }).then(function(res) {

                    var dataGridView = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.dataGridView = dataGridView;
                    $scope.dataGridView.length = Object.keys(dataGridView).length;
                    $scope.data.countRow = AppService.findObjValue($scope.dataGridView, 'Serial_No', null, false).length;

                }).catch(function(res) {
                    AppService.err('getGridView_STRC', res);
                }).finally(function(res) {
                    $ionicLoading.hide();
                });

            }else{
                $scope.data = {};
                AppService.err('', 'กรุณาจัดการ TAG ก่อนรับเข้า');
            }

        }).catch(function(res) {
            AppService.err('getTag_Receive', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });

    };  //end load form


    if (Order_No && Order_Index) {
        loadForm();
    } //end if


    /*--------------------------------------
    Search PalletNo Function
    ------------------------------------- */
    $scope.searchPalletNo = function(PalletNo){

        if(!PalletNo){
            $scope.data.PalletNo = null;
            AppService.err('', 'กรุณาเลือก Pallet', 'input-palletNo');
        }else{
            $ionicLoading.show();
            App.API('chk_Balance_Pallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPalletNo: PalletNo
            }).then(function(res) {

                if(res===true){
                    $scope.data.PalletNo = null;
                    AppService.err('', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin', 'input-palletNo');
                }else{

                    App.API('getPallet_No', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: PalletNo
                    }).then(function(res) {

                        var dataGetPallet_No = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        if(Object.keys(dataGetPallet_No).length > 0){

                            if(dataGetPallet_No[0].PalletStatus_Index != '0010000000000'){
                                $scope.data.PalletNo = null;
                                AppService.err('', 'สถานะ Pallet นี้ ไม่ใช่ EM', 'input-palletNo');
                            }else{

                                App.API('getTagByPallet', {
                                    objsession: angular.copy(LoginService.getLoginData()),
                                    pPallet_No: PalletNo
                                }).then(function(res) {

                                    var dataTagByPallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1; 
                                    if(Object.keys(dataTagByPallet).length > 0){
                                        $scope.data.PalletNo = null;
                                        AppService.err('', 'Pallet นี้ กำลังใช้งาน', 'input-palletNo');
                                    }else{
                                        AppService.focus('input-serialCore');
                                    }

                                }).catch(function(res) {
                                    AppService.err('getTagByPallet', res);
                                }).finally(function(res) {
                                    $ionicLoading.hide();
                                });

                            } //End if(dataGetPallet_No[0].PalletStatus_Index != '0010000000000')

                        }else{
                            $scope.data.PalletNo = null;
                            AppService.err('', 'ไม่พบ Pallet นี้ ในระบบ' ,'input-palletNo');
                        }

                    }).catch(function(res) {
                        AppService.err('getPallet_No', res);
                    }).finally(function(res) {
                        $ionicLoading.hide();
                    });

                }

            }).catch(function(res) {
                AppService.err('chk_Balance_Pallet', res);
            }).finally(function(res) {
                $ionicLoading.hide();
            });
        }

    };


    /*--------------------------------------
    getTagSerial_STRC Function
    ------------------------------------- */
    var getTagSerial_STRC = function(){
        App.API('getTagSerial_STRC', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {

            var dataSerial_STRC = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1; 
            console.log('res = ',dataSerial_STRC);
            if(Object.keys(dataSerial_STRC).length > 0){
                
                App.API('updateSerial_STRC', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    serial_no: $scope.data.SerialCore,
                    pallet_no: $scope.data.PalletNo,
                    tag_no: dataSerial_STRC[0].TAG_No
                }).then(function(res) {

                    loadForm();

                }).catch(function(res) {
                    AppService.err('updateSerial_STRC', res);
                }).finally(function(res) {
                    $ionicLoading.hide();
                });

            }else{
                $scope.data.SerialCore = null;
                $scope.data.PalletNo = null;
                AppService.err('', 'รายการ Tag ใน Order นี้มี Serial ครบแล้ว', 'input-palletNo');
            }

        }).catch(function(res) {
            AppService.err('getTagSerial_STRC', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    searchSerialCore Function
    ------------------------------------- */
    $scope.searchSerialCore = function(SerialCore){

        if(!SerialCore){
            $scope.data.SerialCore = null;
            AppService.err('', 'กรุณาเลือก Serial No.', 'input-serialCore');
        }else{

            $ionicLoading.show();
            App.API('chk_Balance_Pallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPalletNo: SerialCore
            }).then(function(res) {

                if(res===true){
                    $scope.data.SerialCore = null;
                    AppService.err('', 'สถานะ Serial No. ผิดพลาด กรุณาติดต่อ Admin', 'input-serialCore');
                }else{

                    App.API('getPallet_No', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: SerialCore
                    }).then(function(res) {

                        var dataGetSerialCore = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',dataGetSerialCore);
                        if(Object.keys(dataGetSerialCore).length > 0){

                            if(dataGetSerialCore[0].PalletStatus_Index != '0010000000000'){
                                $scope.data.SerialCore = null;
                                AppService.err('', 'สถานะ Serial No. นี้ ไม่ใช่ EM', 'input-serialCore');
                            }else{

                                App.API('getTagBySerial', {
                                    objsession: angular.copy(LoginService.getLoginData()),
                                    pPallet_No: SerialCore
                                }).then(function(res) {

                                    var dataTagByPallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1; 
                                    console.log('res = ',dataTagByPallet);
                                    if(Object.keys(dataTagByPallet).length > 0){
                                        $scope.data.SerialCore = null;
                                        AppService.err('', 'Serial No. นี้ กำลังใช้งาน', 'input-serialCore');
                                    }else{
                                        getTagSerial_STRC();
                                    }

                                }).catch(function(res) {
                                    AppService.err('getTagBySerial', res);
                                }).finally(function(res) {
                                    $ionicLoading.hide();
                                });

                            } //End if(dataGetSerialCore[0].PalletStatus_Index != '0010000000000')

                        }else{
                            $scope.data.SerialCore = null;
                            AppService.err('', 'ไม่พบ Serial No. นี้ ในระบบ' ,'input-serialCore');
                        }

                    }).catch(function(res) {
                        AppService.err('getPallet_No', res);
                    }).finally(function(res) {
                    });

                }

            }).catch(function(res) {
                AppService.err('chk_Balance_Pallet', res);
            }).finally(function(res) {
            });

        }

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.PalletNo){
            $scope.data.PalletNo = null;
            AppService.err('', 'กรุณาเลือก Pallet', 'input-palletNo');
        }else if(!$scope.data.SerialCore){
            $scope.data.SerialCore = null;
            AppService.err('', 'กรุณาเลือก Serial No.', 'input-serialCore');
        }else{

            isError = false;
            $ionicLoading.show();
            App.API('insertForeachData_STReceive_Core', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrorder_index: Order_Index,
                Pallet_No: $scope.data.PalletNo
            }).then(function(res) {
                console.log('res = ',res);
                if(res != 'True'){
                    isError = true;
                    AppService.err('', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                }else{
                    AppService.succ('จัดเก็บเรียบร้อย');
                }
            }).catch(function(res) {
                AppService.err('insertForeachData_STReceive_Core', res);
            }).finally(function(res) {
                $ionicLoading.hide();
            });

            // App.API('getTagSerial_STRC_2', {
            //     objsession: angular.copy(LoginService.getLoginData()),
            //     pstrorder_index: Order_Index
            // }).then(function(res) {

            //     var dataTagSerial2 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            //     if(Object.keys(dataTagSerial2).length > 0){

            //         for(var n in dataTagSerial2){

            //             if(!isError){
            //                 App.API('FindLocationAndInsert_Receive_V2', {
            //                     objsession: angular.copy(LoginService.getLoginData()),
            //                     pPallet_No: $scope.data.PalletNo,
            //                     pQtyPerPallet: dataTagSerial2[n].Qty_per_TAG,
            //                     pstrNewPalletStatus_Index: '0010000000004',
            //                     pstrTag_no: dataTagSerial2[n].TAG_No,
            //                     plot: dataTagSerial2[n].PLot,
            //                     plocation_Alias: 'RM_FLOOR'
            //                 }).then(function(result) {
            //                     console.log('result = ',result);
            //                     if(result != 'True'){
            //                         isError = true;
            //                         AppService.err('', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล ที่ TAG_No{' + dataTagSerial2[n].TAG_No + '}, {' + dataTagSerial2[n].PLot + '}');
            //                     }else if(n == (Object.keys(dataTagSerial2).length-1)){
            //                         AppService.succ('จัดเก็บเรียบร้อย');
            //                     }

            //                 }).catch(function(result) {
            //                     isError = true;
            //                     AppService.err('FindLocationAndInsert_Receive_V2', result);
            //                 }).finally(function(result) {});
            //             }

            //         }   //end for

            //     }

            // }).catch(function(res) {
            //     AppService.err('getTagSerial_STRC_2', res);
            // }).finally(function(res) {
            //     $ionicLoading.hide();
            // });

        }   //end if

    };  //end save



    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[(Position == 'PalletNo') ? 'PalletNo' : 'SerialCore'] = imageData.text.toUpperCase();
                if(Position == 'PalletNo')
                    $scope.searchPalletNo(angular.copy($scope.data.PalletNo));
                if(Position == 'SerialCore')
                    $scope.searchSerialCore(angular.copy($scope.data.SerialCore));
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})


.controller('Store_ReceivingRawMatPackingChemicalCtrl', function($ionicLoading, $scope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {

    $scope.IndexSelected = null;
    $scope.NoSelected = null;
    $scope.orderTopicList = null;
    $ionicLoading.show();

    /*--------------------------------------
    Selected Function
    ------------------------------------- */
    $scope.selected = function(IndexSelected, NoSelected) {
        if (!IndexSelected) {
            AppService.err('', 'ยังไม่ได้เลือกรายการ');
        } else {
            $state.go('store_ReceivingRawMatPackingChemical_Selected', { Order_Index: IndexSelected, Order_No: NoSelected });
        }
    };


    /*--------------------------------------
    Set Selected Function
    ------------------------------------- */
    $scope.setSelected = function(OrderIndex, OrderNo) {
        $scope.IndexSelected = OrderIndex;
        $scope.NoSelected = OrderNo;
    };


    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){
        App.API('GetOrderTopic', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: "And (ms_DocumentType.DocumentType_Index not IN ('0010000000002','0010000000044')) " +
                "AND tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer " +
                "  where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)"
        }).then(function(res) {
            var orderTopicList = (!res['diffgr:diffgram']) ? null : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.orderTopicList = orderTopicList;
            $scope.orderTopicList.length = (orderTopicList) ? Object.keys(orderTopicList).length : 0;
        }).catch(function(res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function() {
            $ionicLoading.hide();       
        });
    };
    $scope.GetOrderTopic_API();
    


})


.controller('Store_ReceivingRawMatPackingChemical_SelectedCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicPopup, $cordovaBarcodeScanner, AppService, App, LoginService) {

    $scope.data = {};
    var Order_Index = $stateParams.Order_Index;
    var Order_No = $scope.data.OrderNo = $stateParams.Order_No;
    var sudOrderNo = null;
    $scope.dsTAGList = {};
    $scope.dsTAGList.length = 0;
    $scope.countItemstatus2 = 0;


    /*--------------------------------------
    Load Form Function
    ------------------------------------- */
    var loadForm = function() {

        $ionicLoading.show();
        App.API('getTag_Receive', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {

            var dataTAG = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            if(Object.keys(dataTAG).length > 0){

                $scope.dsTAGList = dataTAG;
                $scope.dsTAGList.length = Object.keys(dataTAG).length;

                var valueArr = AppService.findObjValue($scope.dsTAGList, 'itemstatus', '1', true);
                $scope.countItemstatus2 = AppService.findObjValue($scope.dsTAGList, 'itemstatus', '2', true).length;
                $scope.data.Product = valueArr[0].Str1_T;
                $scope.data.Lot = valueArr[0].PLot;
                $scope.data.Qty_per_TAG = valueArr[0].Qty_per_TAG;
                $scope.data.TAG_No = valueArr[0].TAG_No;
                $scope.data.BAG = (parseInt(valueArr[0].Qty_per_TAG) / parseInt(valueArr[0].UnitWeight_Index));
                if (sudOrderNo == 'WH')
                    $scope.data.LocationStorage = 'WH14';
                else
                    $scope.data.LocationStorage = 'RM_FLOOR';

                AppService.focus('input-PalletNoBar');

            }else{
                $scope.data = {};
                AppService.err('', 'กรุณาจัดการ TAG ก่อนรับเข้า');
            }

        }).catch(function(res) {
            AppService.err('getTag_Receive', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });

    };  //end load form


    if (Order_No && Order_Index) {
        sudOrderNo = Order_No.substring(0, 2);
        loadForm();
    } //end if


  
    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function() {

        $ionicLoading.show();
        if (!$scope.data.PalletBarcode) {
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!', 'input-PalletNoBar');
        }else if (!$scope.data.Qty_per_TAG || $scope.data.Qty_per_TAG == 0) {
            AppService.err('', 'กรุณากรอกจำนวน KG. !', 'input-Qty_per_TAG');
        } else {

            App.API('getQtyPerPallet_TPIPL', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: $scope.data.PalletBarcode
            }).then(function(res) {
               
                var dataset = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                if (Object.keys(dataset).length <= 0) {
                    $scope.data.PalletBarcode = null;
                    AppService.err('', 'ไม่มี Pallet นี้ ในระบบ', 'input-PalletNoBar');
                }else{

                    App.API('getTagByPallet', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: $scope.data.PalletBarcode
                    }).then(function(res) {
                       
                        var Odt = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        if (Object.keys(Odt).length != 0) {
                            $ionicPopup.confirm({
                                title: 'Confirm',
                                template: 'Pallet นี้กำลังใช้งาน ต้องการจัดเก็บหรือไม่ ?'
                            }).then(function(res) {
                                if(!res) {
                                    $scope.data.PalletBarcode = null;
                                    AppService.focus('input-PalletNoBar');
                                } else {

                                    App.API('FindLocationAndInsert_Receive_V2', {
                                        objsession: angular.copy(LoginService.getLoginData()),
                                        pPallet_No: $scope.data.PalletBarcode,
                                        pQtyPerPallet: (!$scope.data.Qty_per_TAG)?'':$scope.data.Qty_per_TAG,
                                        pstrNewPalletStatus_Index: '0010000000004',
                                        pstrTag_no: (!$scope.data.TAG_No)?'':$scope.data.TAG_No,
                                        plot: (!$scope.data.Lot)?'':$scope.data.Lot,
                                        plocation_Alias: (!$scope.data.LocationStorage)?'':$scope.data.LocationStorage
                                    }).then(function(res) {                                

                                        if (res == 'True') {
                                           
                                           App.API('selectWeight_Pallet_NewRM', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pPallet_No: $scope.data.PalletBarcode
                                            }).then(function(res) {

                                                var dataRes = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                if(Object.keys(dataRes).length >= 0){

                                                    App.API('updateWeight_Pallet_NewRM', {
                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                        pPallet_No: $scope.data.PalletBarcode,
                                                        pWeight: dataRes[0].Weight
                                                    }).then(function(res) {

                                                        $scope.data.PalletBarcode = null;
                                                        AppService.succ('เก็บเรียบร้อย', 'input-PalletNoBar');
                                                        loadForm();

                                                    }).catch(function(res) {
                                                        AppService.err('updateWeight_Pallet_NewRM', res);
                                                    }).finally(function() {
                                                        $ionicLoading.hide();
                                                    });

                                                }//end if

                                            }).catch(function(res) {
                                                AppService.err('selectWeight_Pallet_NewRM', res);
                                            }).finally(function(res) {
                                                $ionicLoading.hide();
                                            }); //End call api selectWeight_Pallet_NewRM

                                        } else {
                                            AppService.err('', res);
                                        } //end res True

                                    }).catch(function(res) {
                                        AppService.err('FindLocationAndInsert_Receive_V2', res);
                                    }).finally(function() {
                                        $ionicLoading.hide();
                                    }); //End call api FindLocationAndInsert_Receive_V2

                                }
                            }); // end Confirm
                        }

                    }).catch(function(res) {
                        AppService.err('getTagByPallet', res);
                    }).finally(function() {
                        $ionicLoading.hide();
                    }); // End call api getTagByPallet

                }

            }).catch(function(res) {
                AppService.err('getTagByPallet', res);
            }).finally(function() {
                $ionicLoading.hide();
            });

        }

    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };



});
