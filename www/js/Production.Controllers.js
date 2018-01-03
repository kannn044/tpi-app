/**
 * Production.Controllers Module
 *
 * Description
 */
angular.module('Production.Controllers', ['ionic'])

.controller('Production_PackingCoreCtrl', function($ionicLoading, App, AppService, LoginService, $filter, $scope, $state, $ionicPopup, $cordovaBarcodeScanner, $ionicScrollDelegate) {
	$scope.data = {};
	$scope.getBaggingOrderHeaderList = {};
	$scope.getShiftHeaderList = {};
	$scope.palletItems = {};
	$scope.tagItems = {};
	$scope.bagserialItems = {};
	$scope.getBaggingOrderHeaderItem = {};
	$scope.recievedCoreItems = [];
	$scope.data.shiftTime = "";
	$scope.data.SerialBarcode = "";
	$scope.data.Order = "";
    $scope.data.odtTable = [];
	$scope.serialNoSelectedIndex = -1;


    /*--------------------------------------
    Set Selected Function
    ------------------------------------- */
    $ionicLoading.show();
	$scope.setSelected = function (index) {
		$scope.serialNoSelectedIndex = index;
	};


    /*--------------------------------------
    Remove Selected Function
    ------------------------------------- */
	$scope.removeSelected = function () {
		$scope.data.odtTable.splice($scope.serialNoSelectedIndex, 1);
		$scope.serialNoSelectedIndex = -1;
		for(var i =0; i<$scope.data.odtTable.length ;i++){
			$scope.data.odtTable[i].Seq = i+1;
		}
	};


    /*--------------------------------------
    Load Recieved Core Function
    ------------------------------------- */
	$scope.loadRecievedCore = function () {

        App.API('getGridView_BGRC', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: $scope.baggingorder_index
        }).then(function(res) {

            $scope.recievedCoreItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',$scope.recievedCoreItems );

        }).catch(function(res) {
            AppService.err('getGridView_BGRC', res);
        }).finally(function(res) {
            $ionicLoading.hide();
            
        });
            
    };
	
	
    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $scope.getBaggingOrderHeader_API = function(){
        App.API('getBaggingOrderHeader', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "And Status ='1'" 
        }).then(function(res) {
            $scope.getBaggingOrderHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',$scope.getBaggingOrderHeaderList);
        }).catch(function(res) {
            AppService.err('getBaggingOrderHeaderList', res);
        }).finally(function(res) {
            $ionicLoading.hide();
            $("#orderItem").focus();
        });
    };
    $scope.getBaggingOrderHeader_API();
    

    /*--------------------------------------
    Call API getShift
    ------------------------------------- */
    $scope.getShift_API = function(){
        App.API('getShift', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "" 
        }).then(function(res) {
            $scope.getShiftHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',$scope.getShiftHeaderList);
        }).catch(function(res) {
            AppService.err('getShift', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };
	$scope.getShift_API();


    /*--------------------------------------
    Change Shift Function
    ------------------------------------- */
	$scope.changeShift = function(value) {
		
        var item = value.split(',');
        $scope.WorkShifts_Index = item[0];
        $scope.data.shiftTime = item[1];
        $("#barcode").focus();

	};


    /*--------------------------------------
    Change Barcode Function
    ------------------------------------- */
	$scope.changeBarcode = function(value) {
		
        if($scope.data.Order == ""){
            AppService.err('Notice', "กรุณาเลือก Serial No.");
            $scope.data.SerialBarcode = "";
            $("#barcode").focus();
        }else{
            if(value.length > 5){
                App.API('chk_Balance_Pallet', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pPalletNo: value 
                }).then(function(res) {

                    if(res){
                        AppService.err('Notice', "สถานะ Serial No. ผิดพลาด กรุณาติดต่อ Admin ");
                    }else{
                        $scope.getPallet_No = function(){

                            App.API('getPallet_No', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pPallet_No: value 
                            }).then(function(res) {

                                $scope.palletItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                var palletItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                var palletItemsLength = Object.keys(palletItems).length;

                                if(palletItemsLength > 0){
                                    if($scope.palletItems[0].PalletStatus_Index != "0010000000000"){
                                        AppService.err('Notice', "สถานะ Serial No. นี้ ไม่ใช่ EM,PD");
                                    }else{
                                        App.API('getTagBySerial', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pPallet_No: value 
                                        }).then(function(res) {

                                            $scope.tagItems  = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            var tagItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            var tagItemsLength = Object.keys(tagItems).length;
                                            console.log('res = ',$scope.tagItems);

                                            if(tagItemsLength > 0){
                                                AppService.err('Notice', "Serial No. นี้กำลังใช้งาน");
                                                $scope.data.SerialBarcode = "";
                                                $("#barcode").focus();
                                                return;
                                            }else{
                                                $scope.data.odtTable.push({Seq:"",Serial_No:value})
                                                $scope.data.SerialBarcode = "";
                                                $("#barcode").focus();
                                            }

                                        }).catch(function(res) {
                                            AppService.err('getBagSerial_BGRC', res);
                                        }).finally(function(res) {
                                        });
                                    } // End if($scope.palletItems[0].PalletStatus_Index != "0010000000000")
                                }else{
                                        AppService.err('Notice', "ไม่พบ Serial No. นี้ในระบบ");
                                        $scope.data.SerialBarcode = "";
                                        $("#orderItem").focus();
                                        return;
                                } // End if(palletItemsLength > 0)

                            }).catch(function(res) {
                                AppService.err('getPallet_No', res);
                            }).finally(function(res) {
                            });

                        }; // End $scope.getPallet_No Function
                            
                        App.API('getBagSerial_BGRC', { 
                            objsession: angular.copy(LoginService.getLoginData()), 
                            baggingorder_index: $scope.baggingorder_index , 
                            serial_no : value 
                        }).then(function(res) {

                            $scope.bagserialItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                            var bagserialItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                            var bagserialItemsLength = Object.keys(bagserialItems).length;
                            console.log('res = ',$scope.bagserialItems);
                            
                            if(bagserialItemsLength > 0){
                                AppService.err('Notice', "Serial No. นี้มีแล้วใน Production No. นี้");
                                $scope.data.SerialBarcode = "";
                                $("#barcode").focus();
                                return;
                            }else{
                                
                                var item = $filter('filter')($scope.data.odtTable, {Serial_No: value})[0];
                                if(item){
                                    AppService.err('Notice', "Serial No. นี้มีแล้วใน Production No. นี้");
                                    $scope.data.SerialBarcode = "เลือก Serial No. นี้ไปแล้ว";
                                    $("#barcode").focus();
                                    return;
                                }else{
                                    $scope.getPallet_No();
                                }
                            }

                        }).catch(function(res) {
                            AppService.err('getBagSerial_BGRC', res);
                        }).finally(function(res) {
                        });
                        
                    }
                }).catch(function(res) {
                    AppService.err('getPallet_No', res);
                }).finally(function(res) {
                }); //End Call API chk_Balance_Pallet
                    
            } //End if(value.length > 5)
        } // End if($scope.data.Order == "")
	};


    /*--------------------------------------
    Change Order Function
    ------------------------------------- */
	$scope.changeOrder = function(value) {

        if (!value) {

            $scope.data = {};
            $scope.getBaggingOrderHeaderItem = {};
            $scope.rollList = {};

        } else {
			
            $scope.data.Order = value;
            var item = value.split(',');
			$scope.getBaggingOrderHeaderItem = item;

            $scope.baggingorder_no =  item[0],
            $scope.baggingorder_index = item[1],

            $ionicLoading.show();
			$scope.loadRecievedCore();

            App.API('getBaggingOrderHeader', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pstrWhere: "And BaggingOrder_No ='" + item[0] + "'" 
            }).then(function(res) {
                $scope.getBaggingOrderHeaderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                $scope.data.lot = $scope.getBaggingOrderHeaderItem.PLot;
                $scope.data.total = $scope.getBaggingOrderHeaderItem.Total_Qty;
                var skuIndex = $scope.getBaggingOrderHeaderItem.Sku_Index;

                App.API('GetSKU_By_SKU_Index', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrSKU_Index: skuIndex 
                }).then(function(res) {
                    $scope.skuList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    if ($scope.skuList[0]) {
                        $scope.data.grade = $scope.skuList[0].Sku_Id;
                    }
                }).catch(function(res) {
                    AppService.err('GetSKU_By_SKU_Index', res);
                }).finally(function(res) {
                });

                App.API('getBaggingOrderItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWhere: " AND BaggingOrder_Index = '" + item[1] + "' "
                }).then(function(res) {
                    $scope.orderItemList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    var orderItemList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.data.count = Object.keys(orderItemList).length;;
                }).catch(function(res) {
                    AppService.err('getBaggingOrderItem', res);
                }).finally(function(res) {
                });

            }).catch(function(res) {
                AppService.err('getBaggingOrderHeader', res);
            }).finally(function(res) {

            });

            App.API('getGridView_Roll', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                whereSql: " WHERE tb_BaggingOrderItem.BaggingOrder_Index = '" + item[1] + "'" 
            }).then(function(res) {
                var rollList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                $scope.rollList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                $scope.rollList.length = Object.keys(rollList).length;
            }).catch(function(res) {
                AppService.err('getGridView_Roll', res);
            }).finally(function(res) {
            });

            $scope.data.weigth = "0";
            $scope.data.length = "0";
            $scope.data.roll = "";
            $ionicLoading.hide();

            $("#barcode").focus();
        }
    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {

        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.SerialBarcode = imageData.text.toUpperCase();
                $scope.changeBarcode($scope.data.SerialBarcode);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
	$scope.save = function(value) {

		if(!$scope.data.odtTable || $scope.data.odtTable.length == 0){
			AppService.err('Notice', "ไม่มีรายการ Serial No.");
			$scope.data.SerialBarcode = "";
			$("#barcode").focus();
		}else{

            var items = [];
            angular.forEach($scope.data.odtTable, function(value, key) {
                var item = {
                    "Seq": (key+1).toString(), 
                    "Serial_No": value.Serial_No
                }
                this.push(item);
            }, items);
            var ads = { 
                "Table1": items
            };
            
            App.API('insertSerialtoPD', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                ads: JSON.stringify(ads),
                baggingorder_index:  $scope.baggingorder_index,
                baggingorder_no: $scope.baggingorder_no,
                WorkShifts_Index: $scope.WorkShifts_Index
            }).then(function(res) {
                console.log('res = ',res);
                // var rollList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                // $scope.rollList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                // $scope.rollList.length = Object.keys(rollList).length;
            }).catch(function(res) {
                AppService.err('insertSerialtoPD', res);
            }).finally(function(res) {
            });
        }
		 
	};


})

.controller('Production_PackingRollCtrl', function($ionicLoading, App, AppService, LoginService, $filter, $scope, $state, $ionicPopup, $cordovaBarcodeScanner, $ionicScrollDelegate) {
    // hudcha
    $scope.data = {};
    $scope.data.grade = "";
    $scope.data.lot = "";
    $scope.data.total = "";
    $scope.data.count = "";
    $scope.data.weigth = "";
    $scope.data.length = "0";
    $scope.data.roll = "";
    $scope.getBaggingOrderHeaderList = {};
    $scope.getBaggingOrderHeaderItem = {};
    $scope.skuList = {};
    $scope.barcode = "";
    $scope.orderItemList = {};
    $scope.rollList = {};
    $scope.rollList.length = "";
    $scope.isDisable = false;
    $scope.BaggingOrder_No = "";
    $scope.BaggingOrder_Index = "";
    var whereStr = "";
    var isExit = true;
    

    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $scope.getBaggingOrderHeader_API = function(){
        $ionicLoading.show();
        App.API('getBaggingOrderHeader', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "And Status ='1'" 
        }).then(function(res) {
            $scope.getBaggingOrderHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        }).catch(function(res) {
            AppService.err('getBaggingOrderHeaderList', res);
        }).finally(function(res) {
            $ionicLoading.hide();
            $("#orderItem").focus();
        });
    };
    $scope.getBaggingOrderHeader_API();
    

    /*--------------------------------------
    Call API getGridView_Roll
    ------------------------------------- */
    $scope.getGridView_Roll_API = function(){
        $ionicLoading.show();
        whereStr = " WHERE tb_BaggingOrderItem.BaggingOrder_Index = '" + $scope.BaggingOrder_Index + "'";
        App.API('getGridView_Roll', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            whereSql: whereStr 
        }).then(function(res) {
            $scope.rollList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.rollList.length = Object.keys($scope.rollList).length;
            console.log('res = ',$scope.rollList);
        }).catch(function(res) {
            AppService.err('getGridView_Roll', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    Change Order Function
    ------------------------------------- */
    $scope.changeOrder = function(value) {

        if (!value) {

            $scope.data = {};
            $scope.getBaggingOrderHeaderItem = {};
            $scope.rollList = {};

        } else {

            $scope.data.Order = value;
            var item = value.split(',');
            $scope.BaggingOrder_No = item[0];
            $scope.BaggingOrder_Index = item[1];
			$scope.getBaggingOrderHeaderItem = item;

            $ionicLoading.show();
            App.API('getBaggingOrderHeader', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pstrWhere: "And BaggingOrder_No ='" + $scope.BaggingOrder_No + "'" 
            }).then(function(res) {
                $scope.getBaggingOrderHeaderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                $scope.data.lot = $scope.getBaggingOrderHeaderItem.PLot;
                $scope.data.total = $scope.getBaggingOrderHeaderItem.Total_Qty;

                var skuIndex = $scope.getBaggingOrderHeaderItem.Sku_Index;

                App.API('GetSKU_By_SKU_Index', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrSKU_Index: skuIndex 
                }).then(function(res) {
                    $scope.skuList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    console.log('res = ',$scope.skuList);
                    if ($scope.skuList[0]) {
                        $scope.data.grade = $scope.skuList[0].Sku_Id;
                    }
                }).catch(function(res) {
                    AppService.err('GetSKU_By_SKU_Index', res);
                }).finally(function(res) {
                });

                whereStr = " AND BaggingOrder_Index = '" + $scope.BaggingOrder_Index + "' ";
                App.API('getBaggingOrderItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWhere: whereStr 
                }).then(function(res) {
                    $scope.orderItemList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.data.count = Object.keys($scope.orderItemList).length;;
                    console.log('res = ',$scope.orderItemList);
                }).catch(function(res) {
                    AppService.err('getBaggingOrderItem', res);
                }).finally(function(res) {
                    $ionicLoading.hide();
                });
                

            }).catch(function(res) {
                AppService.err('getBaggingOrderHeader', res);
            }).finally(function(res) {
            });

            $scope.getGridView_Roll_API();

            $scope.data.weigth = "0";
            $scope.data.length = "0";
            $scope.data.roll = "";

            $("#barcode").focus();
        }
    };


    /*--------------------------------------
    Insert Item Function
    ------------------------------------- */
    $scope.insertItem = function() {

        if($scope.data.PalletBarcode){
			$ionicPopup.confirm({
                title: 'Confirm',
                template: 'ยืนยันการบันทึกหรือไม่ ?'
              }).then(function(res) {
                if (!res) {
					$scope.data.PalletBarcode = "";
					$("#barcode").focus();
					return true;
                }else{
					var weigthScale = 0;
					var rollTolot = {};

					App.API('getWeightScaleData', { 
                         objsession: angular.copy(LoginService.getLoginData()), 
                         whereSql: whereStr 
                    }).then(function(res) {
						weigthScale = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
						console.log('res = ',weigthScale);

						App.API('chkRollToLot', { 
                            objsession: angular.copy(LoginService.getLoginData()),  
                            lot: $scope.data.lot, 
                            roll: $scope.data.roll, 
                            BaggingOrder_No: $scope.BaggingOrder_No 
                        }).then(function(res) {
							var rollTolotTab = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
							var roll_Length = Object.keys(rollTolotTab).length;

							if(roll_Length > 0 && rollTolotTab[0].Weight != "0" ){
                                $ionicLoading.show();

								App.API('getBaggingOrderItem', { 
                                    objsession: angular.copy(LoginService.getLoginData()),  
                                    pstrWhere: " AND BaggingOrder_Index = '" + $scope.BaggingOrder_Index + "' AND Roll_No = '" + $scope.data.roll + "' AND (Status in (1,2)) "    
                                }).then(function(res) {
                                    var baggingOrderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                    var baggingOrderItem_Length = Object.keys(baggingOrderItem).length;
                                    console.log('res = ',baggingOrderItem);
                                    
                                    if(baggingOrderItem_Length > 0){
                                        $ionicLoading.hide();
                                        AppService.err('',"มี Roll นี้ในระบบเเล้ว");
                                        $scope.data.PalletBarcode = "";
                                        $scope.data.length = "";
                                        $("#barcode").focus();

                                    }else{

                                        App.API('getBaggingOrderItem', { 
                                            objsession: angular.copy(LoginService.getLoginData()),  
                                            pstrWhere: " AND BaggingOrder_Index = '" + $scope.BaggingOrder_Index + "'  "  
                                        }).then(function(res) {
                                            var baggingOrderItem_ByIndex = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            var baggingOrderItem_ByIndex_Length = Object.keys(baggingOrderItem_ByIndex).length;
                                            console.log('res = ',baggingOrderItem_ByIndex);
                                            $scope.seq = 0;

                                            if(baggingOrderItem_ByIndex_Length > 0 ){
                                                $scope.seq = baggingOrderItem_ByIndex_Length + 1;
                                            }else{
                                                $scope.seq = 1;
                                            }

                                            var decimal_length = Number($scope.data.length.replace(/[^0-9\.]+/g,""));
                                            App.API('insertBaggingOrderItem', { 
                                                objsession: angular.copy(LoginService.getLoginData()),  
                                                baggingorder_index: $scope.BaggingOrder_Index,
                                                roll : $scope.data.roll, 
                                                seq: $scope.seq,
                                                // decimal_length : parseInt($scope.data.length)
                                                decimal_length: decimal_length
                                            }).then(function(res) {
                                                console.log('res = ',res);
                                                AppService.succ('เพิ่มเรียบร้อย', '');

                                            }).catch(function(res) {
                                                AppService.err('insertBaggingOrderItem', res);
                                            }).finally(function(res) {
                                                $scope.getGridView_Roll_API();
                                                $ionicLoading.hide();
                                            });

                                        }).catch(function(res) {
                                            AppService.err('getBaggingOrderItem', res);
                                        }).finally(function(res) {
                                            $ionicLoading.hide();
                                        });

                                    } // End if(baggingOrderItem_Length > 0)

                                }).catch(function(res) {
                                    AppService.err('getBaggingOrderItem', res);
                                }).finally(function(res) {
                                });

							}else{
                                AppService.err('', "Roll นี้น้ำหนักเป็น 0");
                                $scope.data.PalletBarcode = "";
                                $scope.data.length = "";
                                $("#barcode").focus();
							} //End if(roll_Length > 0 && rollTolotTab[0].Weight != "0" )

						}).catch(function(res) {
							AppService.err('getGridView_Roll', res);
						}).finally(function(res) {
						});
					
					}).catch(function(res) {
						AppService.err('getGridView_Roll', res);
					}).finally(function(res) {
					});
					return false;
                } //End if Confirm to Insert Item
              }); //End Confirm Popup
		}

    };


    /*--------------------------------------
    Insert Item Function
    ------------------------------------- */
    $scope.save = function(value) {

        $ionicLoading.show();
        if ($scope.data.PalletBarcode === undefined || $scope.data.PalletBarcode == "") {
            AppService.err('Save', "BarCode ไม่ได้ Input");
        } else {
            //1700613R0001P
            $scope.data.pos = $scope.data.PalletBarcode.indexOf("R");
            $scope.data.lot_item = $scope.data.PalletBarcode.substring(0, $scope.data.pos);
            $scope.data.roll = $scope.data.PalletBarcode.substring($scope.data.pos + 1);
            $scope.data.q_roll = $scope.data.roll.substring(4);

            var skuIndex = $scope.getBaggingOrderHeaderItem.Sku_Index;
            App.API('GetSKU_By_SKU_Index', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pstrSKU_Index: skuIndex 
            }).then(function(res) {
                $scope.skuList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',$scope.skuList);

                if ($scope.skuList[0]) {
                    $scope.data.grade = $scope.skuList[0].Sku_Id;
                    switch ($scope.data.q_roll) {
                        case "":
                            {
                                $scope.data.length = $scope.skuList[0].Unit_Length;
                                $scope.insertItem();
                                break;
                            }
                        case "P":
                            {
                                $scope.data.length = "";
                                $("#textlength").focus();
                                break;
                            }
                        case "S":
                            {
                                $scope.data.length = $scope.skuList[0].Unit_Length;
                                $scope.insertItem();
                                break;
                            }
                        case "SP":
                            {
                                $scope.data.length = "";
                                $("#textlength").focus();
                                break;
                            }
                        default:
                            {
                                $scope.data.length = $scope.skuList[0].Unit_Length;
                                $scope.insertItem();
                                break;
                            }
                    }
                }

            }).catch(function(res) {
                AppService.err('GetSKU_By_SKU_Index', res);
            }).finally(function(res) {
            });
        }
        $ionicLoading.hide();
    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(value) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save(value);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };



})

.controller('Production_PackToPalletCtrl', function($ionicLoading, App, AppService, LoginService, $filter, $scope, $state, $ionicPopup, $cordovaBarcodeScanner, $ionicScrollDelegate) {
	
    $scope.data = {};
	$scope.getBaggingOrderHeaderItem = {};
	$scope.odtItems = [];
	$scope.dt_bgiItems = [];
	$scope.currentPalletItems = [];
	$scope.data.gridTable = [];
	$scope.data.gridTableLength = "";
	$scope.data.grade = "";
    $scope.data.PalletBarcode = "";
	$scope.data.RollBarcode = "";
	$scope.odtItems.length = 0;
	$scope.i = 0;
    $scope.skuIndex = "";
    $scope.lengRoll = "";

    var pos = "";
    var lot = "";
    var roll = "";


    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $scope.getBaggingOrderHeader_API = function(){
        App.API('getBaggingOrderHeader', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "And Status ='1'" 
        }).then(function(res) {
            $scope.getBaggingOrderHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        }).catch(function(res) {
            AppService.err('getBaggingOrderHeaderList', res);
        }).finally(function(res) {
            $ionicLoading.hide();
            $("#orderItem").focus();
        });
    };
    $scope.getBaggingOrderHeader_API();
    


    /*--------------------------------------
    Load Grid Table Function
    ------------------------------------- */    
    $scope.loadGridTable = function (){
        $ionicLoading.show();
        App.API('getGridView_Roll', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            whereSql: " WHERE Pallet_No = '" + $scope.data.PalletBarcode + "' AND tb_BaggingOrder.BaggingOrder_No = '" + $scope.BaggingOrder_No + "'" 
        }).then(function(res) {
            $scope.data.gridTable =  (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            var gridTable = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.data.gridTableLength = Object.keys(gridTable).length;
            console.log('res = ', res);
        }).catch(function(res) {
            AppService.err('getGridView_Roll', res);
        }).finally(function(res) {
           $ionicLoading.hide();
        });
            
    };


    /*--------------------------------------
    Load Grid TableW Function
    ------------------------------------- */
    $scope.loadGridTableW = function (){
        $ionicLoading.show();
        App.API('getGridView_Roll', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            whereSql: " WHERE Pallet_No = '" + $scope.dara.PalletBarcode + "' and tb_BaggingOrderItem.Status = 1 " 
        }).then(function(res) {
            console.log('res = ',res);
            $scope.data.gridTable =  (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.data.gridTableLength = Object.keys($scope.data.gridTable).length;
        }).catch(function(res) {
            AppService.err('getGridView_Roll', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
            
    };



	/*--------------------------------------
    Change Order Function
    ------------------------------------- */
    $scope.changeOrder = function(value) {

        if (!value) {
            $scope.data = {};
        } else {
            $scope.data.Order = value;
            var item = value.split(',');
            $scope.BaggingOrder_No = item[0];
            $scope.Baggingorder_index = item[1];
			$scope.getBaggingOrderHeaderItem = item;

            $ionicLoading.show();

            App.API('getBaggingOrderHeader', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pstrWhere: "And BaggingOrder_No ='" + item[0] + "'" 
            }).then(function(res) {
                $scope.getBaggingOrderHeaderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                $scope.skuIndex = $scope.getBaggingOrderHeaderItem.Sku_Index;

                App.API('GetSKU_By_SKU_Index', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrSKU_Index: $scope.skuIndex 
                }).then(function(res) {
                    $scope.skuList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    if ($scope.skuList[0]) {
                        $scope.data.grade = $scope.skuList[0].Sku_Id;
                    }
                }).catch(function(res) {
                    AppService.err('GetSKU_By_SKU_Index', res);
                }).finally(function(res) {
                });
               
            }).catch(function(res) {
                AppService.err('getBaggingOrderHeader', res);
            }).finally(function(res) {
            });
			
            $ionicLoading.hide();
            $("#PalletBarcode").focus();
        }

    };
    


    /*--------------------------------------
    Check Pallet Function
    ------------------------------------- */
	$scope.checkPallet = function(){

        App.API('getSumWeightBaggingOrderItem', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pallet_no: $scope.data.PalletBarcode ,
            baggingorder_index: $scope.Baggingorder_index
        }).then(function(res) {
            $scope.odtItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            var currentPalletItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.odtItems.length = Object.keys(currentPalletItems).length;
            console.log('res = ',$scope.odtItems);
            
            App.API('chk_Balance_Pallet', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pPalletNo: $scope.data.PalletBarcode
            }).then(function(res) {
                console.log('res = ',res);
                if(res){
                    AppService.err('notice', "สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin ");
                }else{
                    App.API('get_Current_Pallet', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pPalletNo: $scope.data.PalletBarcode 
                    }).then(function(res) {
                        $scope.currentPalletItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        var currentPalletItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        var currentPalletItemsLength = Object.keys(currentPalletItems).length;
                        console.log('res = ',$scope.currentPalletItems);

                        if(currentPalletItemsLength > 0){
                            if(currentPalletItems[0].PalletStatus_id != "EM" && currentPalletItems[0].PalletStatus_id != "BG" ){
                                //สถานะ Pallet นี้ ไม่ใช่ EM หรือ BG
                                AppService.err('notice', "สถานะ Pallet นี้ ไม่ใช่ EM หรือ BG");
                                $("#PalletBarcode").val("");
                                $("#PalletBarcode").focus();
                            }else{
                                var odt_DataTable = [];
                                App.API('getTagByPallet', { 
                                    objsession: angular.copy(LoginService.getLoginData()), 
                                    pPallet_No: $scope.data.PalletBarcode 
                                }).then(function(res) {
                                    odt_DataTable = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                    var items = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                    var itemsLength = Object.keys(items).length;
                                    console.log('getTagByPallet -> ',odt_DataTable);

                                    if(itemsLength > 0){
                                        AppService.err('notice', "Palletนี้กำลังใช้งาน");
                                        $("#PalletBarcode").val("");
                                        $("#PalletBarcode").focus();
                                    }else{
                                        App.API('getBaggingOrderItem', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pstrWhere: "And Pallet_No = '"+$scope.data.PalletBarcode+"' AND (Status in (1))" 
                                        }).then(function(res) {
                                            $scope.dt_bgiItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            var dt_bgiItems = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            var dt_bgiItemsLength = Object.keys(dt_bgiItems).length;
                                            console.log('res =',$scope.dt_bgiItems);

                                            if(dt_bgiItemsLength > 0){
                                                var by_product = $scope.dt_bgiItems[0].Roll_No.indexOf("W");
                                                //console.log('by_product ',by_product);
                                                if(by_product = -1){
                                                    if($scope.dt_bgiItems[0].BaggingOrder_Index == $scope.Baggingorder_index){
                      
                                                        $("#RollBarcode").focus();
                                                        $scope.loadGridTable();
                                                    }else{
                                                        ///"Roll ที่อยู่ใน Pallet นี้ไม่อยู่ใน BagOrder ที่เลือก"
                                                        AppService.err('notice', "Roll ที่อยู่ใน Pallet นี้ไม่อยู่ใน BagOrder ที่เลือก");
                                                        $scope.odtItems = [];
                                                        $scope.odtItems.length = 0;
                                                        $("#PalletBarcode").val("");
                                                        $("#PalletBarcode").focus();
                                                    }
                                                }else{
                                                    $("#RollBarcode").focus();
                                                    $scope.loadGridTableW();
                                                    $scope.i = 0;
                                                }
                                            }else{
                                                $("#RollBarcode").focus();
                                                    $scope.loadGridTable();
                                                    $scope.i = 0;
                                            }
                                        }).catch(function(res) {
                                            AppService.err('get_Current_Pallet', res);
                                        }).finally(function(res) {
                                        });
                                        
                                    } //End if(itemsLength > 0
                                    
                                }).catch(function(res) {
                                    AppService.err('get_Current_Pallet', res);
                                }).finally(function(res) {
                                });
                                    
                            }
                            
                        }else{
                            AppService.err('notice', "ไม่พบ Pallet นี้ในระบบ");
                            $scope.odtItems = [];
                            $scope.odtItems.length = 0;
                            $("#PalletBarcode").val("");
                            $("#PalletBarcode").focus();
                        }//End if(currentPalletItemsLength
                    
                    }).catch(function(res) {
                        AppService.err('get_Current_Pallet', res);
                    }).finally(function(res) {
                    });
                }
            }).catch(function(res) {
                AppService.err('GetSKU_By_SKU_Index', res);
            }).finally(function(res) {
            });

        }).catch(function(res) {
            AppService.err('GetSKU_By_SKU_Index', res);
        }).finally(function(res) {
        });

	};


    /*--------------------------------------
    Check Roll Function
    ------------------------------------- */
    $scope.checkRoll = function(){
        var isError = false;
        if(!$scope.data.RollBarcode){
            AppService.err('', 'กรุณากรอก RollBarcode','RollBarcode');
        }else{
            var pos = $scope.data.RollBarcode.indexOf("R");
            var lot = $scope.data.RollBarcode.substring(0, pos);
            var roll = $scope.data.RollBarcode.substring(pos + 1);
            var lot_w = lot;
            console.log('pos = ',pos);
            console.log('lot = ',lot);
            console.log('roll = ',roll);

            $ionicLoading.show();
            var pstrWhere = "AND Plot ='" + lot + "' AND BaggingOrder_No = '" + $scope.BaggingOrder_No + "'  ";
            App.API('getBaggingOrderHeader', { 
                objsession: angular.copy(LoginService.getLoginData()), 
                pstrWhere: pstrWhere 
            }).then(function(res) {
                var dt_bgo = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',dt_bgo);

                if(dt_bgo && Object.keys(dt_bgo).length > 0){

                    lot = dt_bgo[0].BaggingOrder_Index;

                } // End if(getBaggingOrderHeader_checkRoll && Object.keys(getBaggingOrderHeader_checkRoll).length > 0)

                var by_product = roll.indexOf("W");
                console.log('by_product = ',by_product);
                if(by_product != -1){
                    $ionicLoading.show();
                    App.API('getGridView_Roll', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        whereSql: " WHERE Roll_No like '%W%' " 
                    }).then(function(res) {
                        var check_GridView_Roll = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',check_GridView_Roll);

                        if(check_GridView_Roll && Object.keys(check_GridView_Roll).length <= 0){
                            $ionicLoading.hide();
                            AppService.err('', 'เฉพาะไม่ใช่ By Product');
                            $("#RollBarcode").val("");
                            $("#RollBarcode").focus();
                            isError = true;
                        }

                    }).catch(function(res) {
                        AppService.err('getGridView_Roll', res);
                    }).finally(function(res) {
                        
                        if(!isError){
                            $ionicLoading.show();
                            var where = "And BaggingOrder_Index in "+
                            "( select tb_BaggingOrder.BaggingOrder_Index from tb_BaggingOrder "+
                            "inner join tb_BaggingOrderItem on  tb_BaggingOrder.BaggingOrder_Index = tb_BaggingOrderItem.BaggingOrder_Index "+
                            "where Plot = '" + lot + "' and Roll_No = '" + roll + "') "+
                            "AND Roll_No = '" + roll + "' AND (Status in (1)) AND Pallet_No <> ''  "
                            App.API('getBaggingOrderItem', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pstrWhere: where
                            }).then(function(res) {
                                var dt_bgi = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                console.log('res = ',dt_bgi);

                                if(dt_bgi && Object.keys(dt_bgi).length > 0){
                                    $ionicLoading.hide();
                                    AppService.err('', 'มี Roll นี้ใน Pallet แล้ว');
                                    $("#RollBarcode").val("");
                                    $("#RollBarcode").focus();
                                }else{

                                    var where = "And BaggingOrder_Index in "+
                                    "( select tb_BaggingOrder.BaggingOrder_Index from tb_BaggingOrder"+
                                    "inner join tb_BaggingOrderItem on tb_BaggingOrder.BaggingOrder_Index = tb_BaggingOrderItem.BaggingOrder_Index"+
                                    "where Plot = '" + lot + "' and Roll_No = '" + roll + "')"+
                                    "AND Roll_No = '" + roll + "' AND (Status in (1)) AND Pallet_No = ''  "
                                    App.API('getBaggingOrderItem', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pstrWhere: where
                                    }).then(function(res) {
                                        var dt_bgi = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                        console.log('res = ',dt_bgi);

                                        if(dt_bgi && Object.keys(dt_bgi).length > 0){
                                            
                                            App.API('updatePalletToBaggingOrderItem', { 
                                                objsession: angular.copy(LoginService.getLoginData()), 
                                                pallet_no: $scope.data.PalletBarcode,
                                                baggingorder_index: dt_bgi[0].BaggingOrder_Index,
                                                roll: roll
                                            }).then(function(res) {
                                                
                                            }).catch(function(res) {
                                                AppService.err('updatePalletToBaggingOrderItem', res);
                                            }).finally(function(res) {
                                                
                                                App.API('getSumWeightBaggingOrderItem', { 
                                                    objsession: angular.copy(LoginService.getLoginData()), 
                                                    pallet_no: $scope.data.PalletBarcode,
                                                    baggingorder_index: "W"
                                                }).then(function(res) {
                                                    var dt_sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                    console.log('res = ',dt_sum);

                                                    if(dt_sum && Object.keys(dt_sum).length > 0){
                                                        $ionicLoading.show();
                                                        App.API('updatePalletSumWeight', { 
                                                            objsession: angular.copy(LoginService.getLoginData()), 
                                                            pallet_no: $scope.data.PalletBarcode,
                                                            decimal_count: dt_sum[0].Sum_Qty,
                                                            decimal_weight: dt_sum[0].Sum_Weight,
                                                            fag: "1",
                                                            lot: "",
                                                            sku: ""
                                                        }).then(function(res) {
                                                            
                                                        }).catch(function(res) {
                                                            AppService.err('updatePalletSumWeight', res);
                                                        }).finally(function(res) {
                                                            $scope.loadGridTableW();
                                                        });
                                                    }//end if(dt_sum && Object.keys(dt_sum).length > 0)
                                                
                                                }).catch(function(res) {
                                                    AppService.err('getSumWeightBaggingOrderItem', res);
                                                }).finally(function(res) {
                                                    $ionicLoading.hide();
                                                });
                                                
                                            }); // End call api updatePalletToBaggingOrderItem
                                            
                                        }else{

                                            $ionicLoading.hide();
                                            AppService.err('', 'มี Roll นี้ใน '+ lot );
                                            $("#RollBarcode").val("");
                                            $("#RollBarcode").focus();

                                        }

                                    }).catch(function(res) {
                                        AppService.err('getBaggingOrderItem', res);
                                    }).finally(function(res) {
                                        //$ionicLoading.hide();
                                    });
                                }

                            }).catch(function(res) {
                                AppService.err('getBaggingOrderItem', res);
                            }).finally(function(res) {
                                //$ionicLoading.hide();
                            });
                        }
                        
                    });
                        
                }else{
                    console.log('$scope.Baggingorder_index = ',$scope.Baggingorder_index);
                    console.log('lot = ',lot);
                    if($scope.Baggingorder_index == lot){
                        console.log('Baggingorder_index == lot');

                        var where = "And BaggingOrder_Index = '" + $scope.Baggingorder_index + "' AND Roll_No = '" + roll + "' AND (Status in (1))";

                        App.API('getBaggingOrderItem', { 
                            objsession: angular.copy(LoginService.getLoginData()), 
                            pstrWhere: where
                        }).then(function(res) {
                            var dt_bgi = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                            console.log('res = ',res);

                            if(dt_bgi && Object.keys(dt_bgi).length > 0){

                                var where = "And BaggingOrder_Index = '" + $scope.Baggingorder_index + "' AND Roll_No = '" + roll + "' AND (Status in (1)) AND Pallet_No <> '' ";
                                App.API('getBaggingOrderItem', { 
                                    objsession: angular.copy(LoginService.getLoginData()), 
                                    pstrWhere: where
                                }).then(function(res) {
                                    var baggingOrderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                    console.log('res = ',res);

                                    if(baggingOrderItem && Object.keys(baggingOrderItem).length > 0){
                                        $ionicLoading.hide();
                                        AppService.err('', 'มี Roll นี้ใน Pallet แล้ว');
                                    }else{

                                        var where = "And BaggingOrder_Index = '" + $scope.Baggingorder_index + "' AND Roll_No = '" + roll + "' AND (Status in (1))"
                                        App.API('getBaggingOrderItem', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pstrWhere: where
                                        }).then(function(res) {
                                            var dt_bgi = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                            console.log('res = ',dt_bgi);
                                            if(dt_bgi && Object.keys(dt_bgi).length > 0){

                                                if($scope.i == 1){

                                                    var strRoll = dt_bgi[0].Roll_No;

                                                    if($scope.lengRoll == 4 && strRoll.length != 4){
                                                        $ionicLoading.hide();
                                                        AppService.err('', 'เฉพาะ Premium');
                                                        $("#RollBarcode").val("");
                                                        $("#RollBarcode").focus();
                                                    }else if($scope.lengRoll != 4 && strRoll.length == 4){
                                                        $ionicLoading.hide();
                                                        AppService.err('', 'เฉพาะไม่ใช่ Premium');
                                                        $("#RollBarcode").val("");
                                                        $("#RollBarcode").focus();
                                                    }else {
                                                        $ionicLoading.show();
                                                        App.API('updatePalletToBaggingOrderItem', { 
                                                            objsession: angular.copy(LoginService.getLoginData()), 
                                                            pallet_no: $scope.data.PalletBarcode,
                                                            lot: lot,
                                                            roll: roll
                                                        }).then(function(res) {

                                                        }).catch(function(res) {
                                                            AppService.err('updatePalletToBaggingOrderItem', res);
                                                        }).finally(function(res) {
                                                            
                                                            App.API('getSumWeightBaggingOrderItem', { 
                                                                objsession: angular.copy(LoginService.getLoginData()), 
                                                                pallet_no: $scope.data.PalletBarcode,
                                                                lot: lot
                                                            }).then(function(res) {
                                                                var dt_sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                                console.log('res = ',dt_sum);

                                                                if(dt_sum && Object.keys(dt_sum).length > 0){
                                                                    $ionicLoading.show();
                                                                    App.API('updatePalletSumWeight', { 
                                                                        objsession: angular.copy(LoginService.getLoginData()), 
                                                                        pallet_no: $scope.data.PalletBarcode,
                                                                        decimal_count: dt_sum[0].Sum_Qty,
                                                                        decimal_weight: dt_sum[0].Sum_Weight,
                                                                        fag: "1",
                                                                        lot: lot,
                                                                        sku: $scope.skuIndex
                                                                    }).then(function(res) {
                                                                        
                                                                    }).catch(function(res) {
                                                                        AppService.err('updatePalletSumWeight', res);
                                                                    }).finally(function(res) {
                                                                        $scope.loadGridTable();
                                                                    });
                                                                }//end if(dt_sum && Object.keys(dt_sum).length > 0)
                                                            
                                                            }).catch(function(res) {
                                                                AppService.err('getSumWeightBaggingOrderItem', res);
                                                            }).finally(function(res) {
                                                                $ionicLoading.hide();
                                                                $("#RollBarcode").val("");
                                                                $("#RollBarcode").focus();
                                                            });

                                                        });
                                                    }

                                                }else{

                                                    if($scope.data.gridTable){
                                                        $ionicLoading.show();
                                                        App.API('getGridView_Roll', { 
                                                            objsession: angular.copy(LoginService.getLoginData()), 
                                                            whereSql: " WHERE Pallet_No = '" & $scope.data.PalletBarcode & "' AND tb_BaggingOrder.BaggingOrder_No = '" & $scope.BaggingOrder_No & "'" 
                                                        }).then(function(res) {
                                                            $scope.data.gridTable =  (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                            var gridTable = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                            $scope.data.gridTableLength = Object.keys(gridTable).length;
                                                            
                                                            console.log('res = ',gridTable);
                                                            
                                                            if(gridTable && $scope.data.gridTableLength > 0){
                                                                if(gridTable[0].Roll_No.length == 4 && roll.length != 4){
                                                                    $ionicLoading.hide();
                                                                    AppService.err('', 'เฉพาะ Premium');
                                                                    $("#RollBarcode").val("");
                                                                    $("#RollBarcode").focus();
                                                                }else if(gridTable[0].Roll_No.length != 4 && roll.length == 4){
                                                                    $ionicLoading.hide();
                                                                    AppService.err('', 'เฉพาะไม่ใช่ Premium');
                                                                    $("#RollBarcode").val("");
                                                                    $("#RollBarcode").focus();
                                                                }
                                                            }

                                                        }).catch(function(res) {
                                                            AppService.err('getGridView_Roll', res);
                                                        }).finally(function(res) {
                                                        });
                                                    
                                                    }// end if($scope.data.gridTable)

                                                    $ionicLoading.show();
                                                    App.API('updatePalletToBaggingOrderItem', { 
                                                        objsession: angular.copy(LoginService.getLoginData()), 
                                                        pallet_no: $scope.data.PalletBarcode,
                                                        baggingorder_index: dt_bgi[0].BaggingOrder_Index,
                                                        roll: roll
                                                    }).then(function(res) {
                                                    }).catch(function(res) {
                                                        AppService.err('updatePalletToBaggingOrderItem', res);
                                                    }).finally(function(res) {
                                                        $ionicLoading.show();
                                                        App.API('getSumWeightBaggingOrderItem', { 
                                                            objsession: angular.copy(LoginService.getLoginData()), 
                                                            pallet_no: $scope.data.PalletBarcode,
                                                            baggingorder_index: dt_bgi[0].BaggingOrder_Index
                                                        }).then(function(res) {
                                                            var dt_sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                            console.log('res = ',dt_sum);

                                                            if(dt_sum && Object.keys(dt_sum).length > 0){
                                                                $ionicLoading.show();
                                                                App.API('updatePalletSumWeight', { 
                                                                    objsession: angular.copy(LoginService.getLoginData()), 
                                                                    pallet_no: $scope.data.PalletBarcode,
                                                                    decimal_count: dt_sum[0].Sum_Qty,
                                                                    decimal_weight: dt_sum[0].Sum_Weight,
                                                                    fag: "1",
                                                                    lot: lot,
                                                                    sku: $scope.skuIndex
                                                                }).then(function(res) {
                                                                    
                                                                }).catch(function(res) {
                                                                    AppService.err('updatePalletSumWeight', res);
                                                                }).finally(function(res) {
                                                                    $scope.loadGridTable();
                                                                });
                                                            }//end if(dt_sum && Object.keys(dt_sum).length > 0)
                                                        
                                                        }).catch(function(res) {
                                                            AppService.err('getSumWeightBaggingOrderItem', res);
                                                        }).finally(function(res) {
                                                            $ionicLoading.hide();
                                                            $("#RollBarcode").val("");
                                                            $("#RollBarcode").focus();
                                                            $scope.i = 1;
                                                            $scope.lengRoll = dt_bgi.Rows(0).Item("Roll_No").ToString
                                                        });

                                                    });

                                                }
                                                
                                            }

                                        }).catch(function(res) {
                                            AppService.err('getBaggingOrderItem', res);
                                        }).finally(function(res) {
                                            $ionicLoading.hide();
                                        });
                                            
                                    } // End if(baggingOrderItem && Object.keys(baggingOrderItem).length > 0)

                                }).catch(function(res) {
                                    AppService.err('getBaggingOrderItem', res);
                                }).finally(function(res) {
                                    //$ionicLoading.hide();
                                });
                            }else{
                                $ionicLoading.hide();
                                AppService.err('', 'Roll นี้ไม่ได้อยู่ใน BagOrder');
                                $("#RollBarcode").val("");
                                $("#RollBarcode").focus();
                            } // end if(baggingOrderItem && Object.keys(baggingOrderItem).length > 0)

                        }).catch(function(res) {
                            AppService.err('getBaggingOrderItem', res);
                        }).finally(function(res) {
                            //$ionicLoading.hide();
                        });

                    }else{
                        $ionicLoading.hide();
                        AppService.err('', 'Lot ไม่ตรงกัน');
                        $("#RollBarcode").val("");
                        $("#RollBarcode").focus();
                    }

                }//End if(by_product != -1)

            }).catch(function(res) {
                AppService.err('getBaggingOrderHeaderList', res);
            }).finally(function(res) {
                // $ionicLoading.hide();
                $("#orderItem").focus();
            });

        }

    };



    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.PalletBarcode){
            AppService.err('', 'กรุณากรอก Pallet', 'PalletBarcode');
        }else{

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'คุณต้องการยืนยัน ?'
              }).then(function(res) {
                if(!res) {
                  $scope.data.Pallet = null;
                  AppService.focus('PalletBarcode');
                }else {

                    $ionicLoading.show();
                    var where = "And Pallet_No = '" + $scope.data.PalletBarcode + "' AND (Status in (1)) AND Roll_No like '%W%' ";
                    App.API('getBaggingOrderItem', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pstrWhere: where
                    }).then(function(res) {
                        console.log('res = ',res);
                        var baggingOrderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                        if(baggingOrderItem && Object.keys(baggingOrderItem).length > 0){

                            App.API('getSumWeightBaggingOrderItem', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pallet_no: $scope.data.PalletBarcode,
                            }).then(function(res) {
                                console.log('res = ',res);
                                var dt_sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                                if(dt_sum && Object.keys(dt_sum).length > 0){

                                    App.API('updatePalletSumWeight', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pallet_no: $scope.data.PalletBarcode,
                                        decimal_count: dt_sum[0].Sum_Qty,
                                        decimal_weight: dt_sum[0].Sum_Weight,
                                        fag: "",
                                        lot: "",
                                        sku: ""
                                    }).then(function(res) {
                                        $ionicLoading.hide();
                                        AppService.succ('บันทึกจำนวน Roll เรียบร้อย', '');
                                    }).catch(function(res) {
                                        AppService.err('updatePalletSumWeight', res);
                                    }).finally(function(res) {
                                    });
                                }else{
                                    $ionicLoading.hide();
                                    AppService.err('Pallet หรือ BagOut ผิดพลาด', '');
                                    $scope.data.gridTable = [];
	                                $scope.data.gridTableLength = "";
                                    $scope.data.PalletBarcode = "";
	                                $scope.data.RollBarcode = "";
                                    $("#orderItem").focus();

                                }//end if(dt_sum && Object.keys(dt_sum).length > 0)
                                
                            }).catch(function(res) {
                                AppService.err('getSumWeightBaggingOrderItem', res);
                            }).finally(function(res) {
                            });

                        }else{

                            App.API('getSumWeightBaggingOrderItem', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pallet_no: $scope.data.PalletBarcode,
                                baggingorder_index: $scope.Baggingorder_index
                            }).then(function(res) {
                                console.log('res = ',res);
                                var dt_sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                                if(dt_sum && Object.keys(dt_sum).length > 0){

                                    App.API('updatePalletSumWeight', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pallet_no: $scope.data.PalletBarcode,
                                        decimal_count: dt_sum[0].Sum_Qty,
                                        decimal_weight: dt_sum[0].Sum_Weight,
                                        fag: "1",
                                        lot: lot,
                                        sku: $scope.skuIndex
                                    }).then(function(res) {
                                        $ionicLoading.hide();
                                        AppService.succ('บันทึกจำนวน Roll เรียบร้อย', '');
                                    }).catch(function(res) {
                                        AppService.err('updatePalletSumWeight', res);
                                    }).finally(function(res) {
                                    });
                                }else{
                                    $ionicLoading.hide();
                                    AppService.err('Pallet หรือ BagOut ผิดพลาด', '');
                                    $scope.data.gridTable = [];
	                                $scope.data.gridTableLength = "";
                                    $scope.data.PalletBarcode = "";
	                                $scope.data.RollBarcode = "";
                                    $("#orderItem").focus();


                                }//end if(dt_sum && Object.keys(dt_sum).length > 0)
                                
                            }).catch(function(res) {
                                AppService.err('getSumWeightBaggingOrderItem', res);
                            }).finally(function(res) {
                            });
                            
                        }//end if(dt_sum && Object.keys(dt_sum).length > 0)                        
                        
                    }).catch(function(res) {
                        AppService.err('getBaggingOrderItem', res);
                    }).finally(function() {
                        // $ionicLoading.hide();
                    });

                }
            }); //End Popup
        }

    };

	    


    /*--------------------------------------
    Scan Barcode1 Function
    ------------------------------------- */
    $scope.scanBarcode1 = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.checkPallet();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };

    
    /*--------------------------------------
    Scan Barcode2 Function
    ------------------------------------- */
    $scope.scanBarcode2 = function() {

        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.RollBarcode = imageData.text.toUpperCase();
                $scope.checkRoll();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };
   


})

.controller('Production_DeleteRollCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    $scope.data = {};
    $scope.getBagging = {};
    $scope.getBagging.length = 0;
    $scope.BaggingOrder_index = '';

    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $ionicLoading.show();
    App.API('getBaggingOrderHeader', { 
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "And Status ='1'"
    }).then(function(res) {
        $scope.getBagging = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.getBagging.length = Object.keys($scope.getBagging).length;
    }).catch(function(res) {
        AppService.err('getBaggingOrderHeader', res);
    }).finally(function(res) {
        $ionicLoading.hide();
    });


    /*--------------------------------------
    Change BagOut Function
    ------------------------------------- */
    $scope.changeBagOut = function(dataIndex){

        if(!dataIndex){
            $scope.data = {};
        }else{
            AppService.focus('Roll');
        }

    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataS){

        if(!$scope.data.BagOut){
            AppService.err('', 'กรุณาเลือก Bag Out');
        }else if(!dataS){
            AppService.err('', 'กรุณาเลือก Roll', 'Roll');
        }else{
            $scope.BaggingOrder_index = '';

            $ionicLoading.show();
            App.API('getBaggingOrderHeader', { 
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: "And BaggingOrder_No = '" + $scope.data.BagOut + "' "
            }).then(function(res) {

                var dataBag = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',dataBag);

                if(Object.keys(dataBag).length > 0){
                    $scope.BaggingOrder_index = dataBag[0].BaggingOrder_Index;
                    var pos = dataS.indexOf("R");
                    var lot = dataS.substring(0, pos);
                    var roll = dataS.substring(pos + 1);
                    $scope.getDeleteBaggingOrderItem_API(pos, lot, roll);
                }

            }).catch(function(res) {
                AppService.err('getBaggingOrderHeader', res);
            }).finally(function(res) {});

        }

    };


    /*--------------------------------------
    getDeleteBaggingOrderItem_API Function
    ------------------------------------- */
    $scope.getDeleteBaggingOrderItem_API = function(pos, lot, roll){

        
        App.API('getDeleteBaggingOrderItem', { 
            objsession: angular.copy(LoginService.getLoginData()),
            index: $scope.BaggingOrder_index,
            lot: lot,
            roll: roll
        }).then(function(resDeleteBag) {

            var dataDeleteBag = (!resDeleteBag['diffgr:diffgram']) ? {} : resDeleteBag['diffgr:diffgram'].NewDataSet.Table1;
            console.log('getDeleteBaggingOrderItem -> ',dataDeleteBag);
            
            if(Object.keys(dataDeleteBag).length > 0){
                $scope.data.Grade = dataDeleteBag[0].Sku_Id_T;
                $scope.data.Lot = dataDeleteBag[0].PLot_T;
                $scope.data.Pallet = dataDeleteBag[0].Pallet_No_T;
                $scope.data.Status = dataDeleteBag[0].PalletStatus_Id_T;
                $scope.data.Weight = dataDeleteBag[0].Weight_Act_T;
                $scope.data.Length = dataDeleteBag[0].Qty_T;
                $scope.data.Transfer = dataDeleteBag[0].Status_Tranfer_T;
                BaggingOrder_index = dataDeleteBag[0].BaggingOrderItem_Index;
            }else{
                $scope.data = {};
                AppService.err('', 'ไม่มี Roll นี้ในระบบ หรือ Tranfer ไปแล้ว หรือ ถูกบันทึกใน DPR เเล้ว', 'Roll');
            }
        }).catch(function(res) {
            AppService.err('getDeleteBaggingOrderItem', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });

    };


    /*--------------------------------------
    Delete Function
    ------------------------------------- */
    $scope.delete = function(dataArr){

        if(!dataArr.BagOut){
            AppService.err('', 'กรุณาเลือก Bag Out');
        }else if(!dataArr.Roll){
            AppService.err('', 'กรุณาเลือก Roll', 'Roll');
        }else{

            $ionicPopup.confirm({
                title: 'Confirm',
                template: '"ยืนยันการลบหรือไม่ ?'
            }).then(function(res) {
                if(res) {

                    $ionicLoading.show();
                    App.API('deleteBaggingOrderItem', { 
                        objsession: angular.copy(LoginService.getLoginData()),
                        baggingorderitem_index: BaggingOrder_index
                    }).then(function(res) {
                        $scope.data = {};
                        AppService.succ('ลบเรียบร้อย', 'Roll');
                    }).catch(function(res) {
                        AppService.err('deleteBaggingOrderItem', res);
                    }).finally(function(res) {
                        $ionicLoading.hide();
                    });

                }
            });
        }

    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.Roll = imageData.text.toUpperCase();
                $scope.search(angular.copy($scope.data.Roll));
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };



})

.controller('Production_StampCtrl', function($scope, $ionicPopup, $filter, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    $scope.data = {};
    $scope.getBagging = {};
    $scope.getBagging.length = 0;

    $scope.$on('$ionicView.loaded', function() {
        $scope.data.Date = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
        $scope.data.User = angular.copy(LoginService.getLoginData('Username'));
        AppService.focus('Line');
    });
    

    /*--------------------------------------
    Load Bag Order Function
    ------------------------------------- */
    var LoadBagOrder = function(number){
        $ionicLoading.show();
        App.API('getBaggingOrderHeader', { 
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: "And Status ='1' And BaggingLine_No = '" + number + "'"
        }).then(function(res) {
            $scope.getBagging = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.getBagging.length = Object.keys($scope.getBagging).length;
        }).catch(function(res) {
            AppService.err('getBaggingOrderHeader', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataS, Position){

        if(Position == 'Line'){

            if(!dataS){
                $scope.data.Line = null;
                AppService.err('', 'Line ไม่ได้ Input', 'Line');
            }else{
                var pos = dataS.indexOf("E");
                var line = dataS.substring(0, pos);
                var number = dataS.substring(pos + 1);
                LoadBagOrder(number);
            }

        }else if(Position == 'Barcode'){

            if(!$scope.data.BagOrder){
                AppService.err('', 'กรุณาเลือก Bag Order');
            }else if(!dataS){
                $scope.data.Barcode = null;
                AppService.err('', 'Barcode ไม่ได้ Input', 'Barcode');
            }else{

                $ionicLoading.show();
                App.API('insertProduction_Stamp', { 
                    objsession: angular.copy(LoginService.getLoginData()),
                    Barcode: dataS,
                    Dat: $scope.data.Date,
                    User: $scope.data.User,
                    BagOrder: $scope.data.BagOrder
                }).then(function(res) {
                    console.log('res = ',res);
                    $scope.data.Barcode = null;
                    $scope.data.Date = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
                    $scope.data.User = angular.copy(LoginService.getLoginData('Username'));
                    AppService.succ('บันทึกเรียบร้อย', 'Barcode');
                }).catch(function(res) {
                    AppService.err('insertProduction_Stamp', res);
                }).finally(function(res) {
                    $ionicLoading.hide();
                });

            }

        }

    };


    /*--------------------------------------
    Change Bag Order Function
    ------------------------------------- */
    $scope.changeBagOrder = function(dataIndex){
        if(!dataIndex){
            $scope.data = {};
        }else{
            AppService.focus('Barcode');
        }
    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[Position] = imageData.text.toUpperCase();
                $scope.search(angular.copy($scope.data[Position]), Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };




})

.controller('Production_RawMatCtrl', function($ionicLoading, $scope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {

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
            $state.go('production_RawMat_Selected', { Order_Index: IndexSelected, Order_No: NoSelected });
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
            pstrWhere: "And (ms_DocumentType.DocumentType_Index IN ('0010000000005')) " +
                "AND tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer " +
                "  where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)"
            // pstrWhere: ""
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


.controller('Production_RawMat_SelectedCtrl', function($scope, $state, $stateParams, $ionicLoading, $cordovaBarcodeScanner, AppService, App, LoginService) {

    $scope.data = {};
    var Order_Index = $stateParams.Order_Index;
    var Order_No = $scope.data.OrderNo = $stateParams.Order_No;
    $scope.dataGridView1 = {};
    $scope.dataGridView1.length = 0;
    $scope.dataGridView2 = {};
    $scope.dataGridView2.length = 0;
    $scope.getTag = 0;
    $scope.countitem = 0;
    $scope.data.Location = 'BG_FLOOR';


    /*--------------------------------------
    Load Form Function
    ------------------------------------- */
    var loadForm = function(){
        $ionicLoading.show(); 
        App.API('getTag_Receive', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {
            var getTag = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res =',getTag);
            $scope.getTag = Object.keys(getTag).length;
            $scope.countitem = AppService.findObjValue(getTag, 'itemstatus', '2', true);

            if(Object.keys(getTag).length > 0){

                if(getTag[0].Location_Alias)
                    $scope.data.Location = getTag[0].Location_Alias

                App.API('getTag_Receive_ShowStatus2', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pstrorder_index: Order_Index
                }).then(function(res) {
                    $scope.dataGridView2 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.dataGridView2.length = Object.keys($scope.dataGridView2).length
                    console.log('res = ',$scope.dataGridView2);
                }).catch(function(res) {
                    AppService.err('getTag_Receive_ShowStatus2', res);
                }).finally(function() {
                   
                    App.API('getTag_Receive_ShowStatus1', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pstrorder_index: Order_Index
                    }).then(function(res) {

                        var dataGridView1 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',dataGridView1);
                        if(Object.keys(dataGridView1).length > 0){
                            $scope.dataGridView1 = dataGridView1;
                            $scope.dataGridView1.length = Object.keys(dataGridView1).length;
                        }else{
                            AppService.succ('จัดเก็บรายการเรียบร้อยแล้ว','');
                        }
                    }).catch(function(res) {
                        AppService.err('getTag_Receive_ShowStatus1', res);
                    }).finally(function() {
                       $ionicLoading.hide();
                    });

                }); // End Call API getTag_Receive_ShowStatus2

            }else{
                $ionicLoading.hide(); 
                AppService.focus('Pallet');
            }

        }).catch(function(res) {
            AppService.err('getTag_Receive', res);
        }).finally(function() {
                  
        });
    };
    loadForm();


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.Pallet){
            AppService.err('', 'กรุณากรอกเลขที่ Pallet', 'Pallet');
        }else{
            $ionicLoading.show(); 
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: $scope.data.Pallet
            }).then(function(res) {
                
                var getTagPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',getTagPallet);

                if(Object.keys(getTagPallet).length > 0){
                    $scope.data.Pallet = null;
                    AppService.err('', 'Pallet นี้กำลังใช้งาน', 'Pallet');
                }else{

                    App.API('getQtyPerPallet_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: $scope.data.Pallet
                    }).then(function(resQtyPer) {

                        var getQtyPer = (!resQtyPer['diffgr:diffgram']) ? {} : resQtyPer['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',getQtyPer);
                        if(Object.keys(getQtyPer).length <= 0){
                            $scope.data.Pallet = null;
                            AppService.err('', 'ไม่มี Pallet นี้ในระบบ', 'Pallet');
                        }else{

                            App.API('insertForeachData_PDReceive_Rawmat', {
                                objsession: angular.copy(LoginService.getLoginData()),
                                pstrorder_index: Order_Index,
                                Pallet_No: $scope.data.Pallet,
                                Location: $scope.data.Location
                            }).then(function(res) {
                                console.log('insertForeachData_PDReceive_Rawmat res = ',res);
                                if (res == 'True') {
                                    $scope.data.Pallet = null;
                                    AppService.succ('เก็บเรียบร้อย', 'Pallet');
                                    loadForm();
                                }else {
                                    AppService.err('', 'ไม่มี Pallet นี้ในรายการ');
                                } //end res True
                            }).catch(function(res) {
                                AppService.err('insertForeachData_PDReceive_Rawmat', res);
                            }).finally(function() {
                               $ionicLoading.hide();
                            });

                            // App.API('getTag_Receive_ShowStatus1', {
                            //     objsession: angular.copy(LoginService.getLoginData()),
                            //     pstrorder_index: Order_Index
                            // }).then(function(res) {

                            //     var ShowStatus1 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                            //     console.log('res = ',ShowStatus1);
                                
                            //     if(Object.keys(ShowStatus1).length > 0){

                            //         var arr = $.map(ShowStatus1, function(el) { return el; })
                            //         var Pallet_No = AppService.findObjValue(arr, 'Pallet_No', $scope.data.Pallet, true);
                                    
                            //          if(Pallet_No.length > 0){
                            //             App.API('FindLocationAndInsert_Receive_V2', {
                            //                 objsession: angular.copy(LoginService.getLoginData()),
                            //                 pPallet_No: $scope.data.Pallet,
                            //                 pQtyPerPallet: (!Pallet_No[0].Qty_per_TAG)?'':Pallet_No[0].Qty_per_TAG,
                            //                 pstrNewPalletStatus_Index: '0010000000015',
                            //                 pstrTag_no: (!Pallet_No[0].Tag_No)?'':Pallet_No[0].Tag_No,
                            //                 plot: (!Pallet_No[0].PLot)?'':Pallet_No[0].PLot,
                            //                 plocation_Alias: (!$scope.data.Location)?'':$scope.data.Location
                            //             }).then(function(res) {                                
                            //                 console.log('res = ',res);
                            //                 if (res == 'True') {
                            //                     $scope.data.Pallet = null;
                            //                     AppService.succ('เก็บเรียบร้อย', 'Pallet');
                            //                     loadForm();
                            //                 }else {
                            //                     AppService.err('', res);
                            //                 } //end res True

                            //             }).catch(function(res) {
                            //                 AppService.err('FindLocationAndInsert_Receive_V2', res);
                            //             }).finally(function() {
                            //                 $ionicLoading.hide();
                            //             });
                            //         } // End if(Pallet_No.length > 0)
                            //     }else{
                            //         AppService.succ('จัดเก็บรายการเรียบร้อยแล้ว','' );
                            //     } //End if(Object.keys(ShowStatus1).length > 0)

                            // }).catch(function(res) {
                            //     AppService.err('getTag_Receive_ShowStatus1', res);
                            // }).finally(function() {
                            //    $ionicLoading.hide();
                            // });

                        }

                    }).catch(function(res) {
                        AppService.err('getQtyPerPallet_TPIPL', res);
                    }).finally(function() {
                        $ionicLoading.hide();       
                    });                    
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
                $scope.data.Pallet = imageData.text.toUpperCase();
                $scope.save();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };



})


.controller('Production_IssueRawMatCtrl', function($ionicPopup, $scope, $state, $filter, $stateParams, $ionicLoading, $cordovaBarcodeScanner, AppService, App, LoginService) {

    $scope.data = {};
    $scope.getShift = {};
    $scope.getShift.length = 0;
    $scope.getBagging = {};
    $scope.getBagging.length = 0;
    $scope.TypeIssue = ['Issue', 'Return', 'Damage', 'RecheckBalance'];
    $scope.TypeIssue.length = Object.keys($scope.TypeIssue).length;
    $scope.isIssueQty = false;
    $scope.data.TAG_NO = '';

    $scope.data.StartDate = $filter('date')('', 'dd/MM/yyyy');
    $scope.data.DateMax = $filter('date')('', 'dd/MM/yyyy');



    /*--------------------------------------
    Call API getDate_Current
    ------------------------------------- */
    $scope.getDate_Current_API = function(){

        App.API('getDate_Current', {
            objsession: angular.copy(LoginService.getLoginData())
        }).then(function(res) {
            if(res['diffgr:diffgram']){
                $scope.data.DateMax = $filter('date')(res['diffgr:diffgram'].NewDataSet.Table1[0].Date_Max, 'dd/MM/yyyy');
                console.log('res = ', $scope.data.DateMax);
            }
        }).catch(function(res) {
            AppService.err('getDate_Current', res);
        }).finally(function() {
           $ionicLoading.hide();
        });

    };


    /*--------------------------------------
    Call API getShift
    ------------------------------------- */
    $ionicLoading.show();
    App.API('getShift', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: ''
    }).then(function(res) {
        $scope.getShift = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.getShift.length = Object.keys($scope.getShift).length;
    }).catch(function(res) {
        AppService.err('getShift', res);
    }).finally(function() {
        $scope.getDate_Current_API();
    });


    /*--------------------------------------
    Clear_od Function
    ------------------------------------- */
    var Clear_od = function(){
        $scope.data = {};
        $scope.isIssueQty = false;
        AppService.focus('Pallet');
    };


    /*--------------------------------------
    getPDIssueRawMat_Sum Function
    ------------------------------------- */
    var getPDIssueRawMat_Sum = function(Odt){

        var TAG_No = Odt.TAG_No;

        $ionicLoading.show();
        App.API('getPDIssueRawMat_Sum', {
            objsession: angular.copy(LoginService.getLoginData()),
            str: " and Tag_No = '" + TAG_No + "' and Status = 1 "
        }).then(function(resPDIssue) {
            
            var PDIssue = (!resPDIssue['diffgr:diffgram']) ? {} : resPDIssue['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res ',PDIssue);
            
            if(PDIssue.length > 0){
                $scope.data.Status = PDIssue[0].PalletStatus_Id;
                $scope.data.Lot = PDIssue[0].PLot;
                $scope.data.Product = PDIssue[0].Str1;
                $scope.data.QtyBal = (parseFloat(PDIssue[0].Qty_Bal) - parseFloat(PDIssue[0].Qty_Issue));
                $scope.data.BalanceQty = (parseFloat(angular.copy($scope.data.QtyBal)) - parseFloat(angular.copy($scope.data.IssueQty)));
            }else{
                var Qty_Issue = 0;
                $scope.data.IssueQty = Odt.Qty_Bal;
                $scope.data.Status = Odt.PalletStatus_Id;
                $scope.data.Lot = Odt.PLot;
                $scope.data.Product = Odt.Str1;
                $scope.data.QtyBal = (parseFloat(Odt.Qty_Bal) - parseFloat(Qty_Issue));
                $scope.data.BalanceQty = (parseFloat(angular.copy($scope.data.QtyBal)) - parseFloat($scope.data.IssueQty) );
            }

            if($scope.data.TypeIssue == 'RecheckBalance'){
                $scope.data.IssueQty = 0;
                $scope.isIssueQty = true;
                $scope.data.BalanceQty = angular.copy($scope.data.QtyBal);
            }

        }).catch(function(res) {
            AppService.err('getPDIssueRawMat_Sum', res);
        }).finally(function() {
           $ionicLoading.hide();
           AppService.focus('IssueQty');
        });
    };
    

    /*--------------------------------------
    Input IssueQty Function
    ------------------------------------- */
    $scope.inputIssueQty = function (IssueQty){

        if(IssueQty > $scope.data.QtyBal){
            AppService.err('', 'จำนวนเบิกมากกว่า Lot', 'IssueQty');
        }else{
            $scope.data.BalanceQty = $scope.data.QtyBal - IssueQty;
        }
       
    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataS, Position){

        switch(Position){
            case 'Line':

                if(!dataS){
                    AppService.err('', 'กรุณาใส่ค่า Line No.', 'Line');
                }else{
                    var splitLine = dataS.split("LINE");
                    var Line = splitLine[1];
                    $ionicLoading.show();
                    App.API('getBaggingOrderHeader', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pstrWhere: "and DocumentType_Index not in (0010000000078) and BaggingLine_No = '" + Line + "' order by BaggingOrder_No"
                    }).then(function(res) {
                        
                        $scope.getBagging = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        $scope.getBagging.length = Object.keys($scope.getBagging).length;
                        console.log('res = ',$scope.getBagging);

                    }).catch(function(res) {
                        AppService.err('getBaggingOrderHeader', res);
                    }).finally(function() {
                       $ionicLoading.hide();
                    });
                }
                break;
            case 'Pallet':

                if(!$scope.data.Line){
                    AppService.err('', 'กรุณาใส่ค่า Line No.', 'Line');
                }else if(!dataS){
                    AppService.err('', 'กรุณาใส่ค่า Pallet No.', 'Pallet');
                }else{

                    $scope.data.TAG_NO = '';

                    var pos = dataS.indexOf("R");
                    console.log('pos ',pos);
                    if(pos > 0){

                        var lot = dataS.substring(0, pos);
                        var roll = dataS.substring(pos + 1);

                        console.log('lot ',lot);
                        console.log('roll ',roll);

                        $ionicLoading.show();
                        
                        App.API('getTagByRoll', {
                            objsession: angular.copy(LoginService.getLoginData()),
                            lot: (!lot) ? '' : lot,
                            roll: (!roll) ? '' : roll
                        }).then(function(res) {

                            var getTagByRoll = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                            console.log('getTagByRoll ',getTagByRoll);
                            if(Object.keys(getTagByRoll).length > 0){

                                if(getTagByRoll[0].Ref_No1_T){

                                    App.API('getBaggingOrderAll', {
                                        objsession: angular.copy(LoginService.getLoginData()),
                                        pstrWhere: "and Status in (1,2) and BaggingOrder_No = '" + getTagByRoll[0].Ref_No1_T + "'"
                                    }).then(function(resOrderAll) {

                                        var OrderAll = (!resOrderAll['diffgr:diffgram']) ? {} : resOrderAll['diffgr:diffgram'].NewDataSet.Table1;
                                        if(OrderAll[0].BaggingLine_No != $scope.data.Line){
                                            AppService.err('', 'Roll No. นี้ อยู่ใน Line');
                                            Clear_od();
                                        }

                                    }).catch(function(res) {
                                        AppService.err('getBaggingOrderAll', res);
                                    }).finally(function() {});

                                }

                                if(getTagByRoll[0].Qty_Bal <= 0){
                                    AppService.err('', 'Roll No. นี้ ไม่มีของแล้ว');
                                     Clear_od();
                                }

                                $scope.data.TAG_NO = getTagByRoll[0].TAG_No;

                                getPDIssueRawMat_Sum(getTagByRoll[0].TAG_No);

                            }else{
                                AppService.err('', 'ไม่มีการรับเข้า Roll No. นี้');
                                Clear_od();
                            }

                        }).catch(function(res) {
                            AppService.err('getTagByRoll', res);
                        }).finally(function() {
                           $ionicLoading.hide();
                        });

                    }else{

                        $ionicLoading.show();
                        App.API('chk_Balance_Pallet', {
                            objsession: angular.copy(LoginService.getLoginData()),
                            pPalletNo: dataS
                        }).then(function(resChk) {
                            
                            if(resChk===true){
                                $scope.data.Pallet = null;
                                AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'Pallet');
                            }else{

                                App.API('getPallet_No', {
                                    objsession: angular.copy(LoginService.getLoginData()),
                                    pPallet_No: dataS
                                }).then(function(res) {
                                    var dataPallet_No = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                    console.log('res = ',dataPallet_No);

                                    if(Object.keys(dataPallet_No).length > 0){

                                        if(dataPallet_No[0].PalletStatus_Index != '0010000000015' ){
                                            $scope.data.Pallet = null;
                                            AppService.err('', 'สถานะ Pallet No. นี้ ไม่ใช่ PD', 'Pallet');
                                        }else{

                                            App.API('getTagByPallet', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pPallet_No: dataS
                                            }).then(function(resTagByP) {
                                                var Odt = (!angular.isObject(resTagByP['diffgr:diffgram'])) ? {} : resTagByP['diffgr:diffgram'].NewDataSet.Table1;
                                                console.log('res = ',Odt);

                                                if (Object.keys(Odt).length > 0) {

                                                    if(Odt[0].Ref_No1_T){

                                                        App.API('getBaggingOrderAll', {
                                                            objsession: angular.copy(LoginService.getLoginData()),
                                                            pstrWhere: "and Status in (1,2) and BaggingOrder_No = '" + Odt[0].Ref_No1_T + "'"
                                                        }).then(function(resB) {
                                                           
                                                            var Odt2 = (!angular.isObject(resB['diffgr:diffgram'])) ? {} : resB['diffgr:diffgram'].NewDataSet.Table1;
                                                            console.log('res = ',Odt2);
                                                            var splitLine = $scope.data.Line.split("LINE");
                                                            var Line = splitLine[1];
                                                            if(Odt2[0].BaggingLine_No != Line){
                                                                AppService.err('', 'Pallet No. นี้ อยู่ใน Line ');
                                                                Clear_od();
                                                            }

                                                        }).catch(function(res) {
                                                            AppService.err('getBaggingOrderAll', res);
                                                        }).finally(function() {});
                                                    }//end if Ref_No1_T

                                                    $scope.data.TAG_NO = Odt[0].TAG_No;
                                                    getPDIssueRawMat_Sum(Odt[0]);

                                                }else{
                                                    AppService.err('', 'ไม่มีการรับเข้า Pallet No. นี้');
                                                    Clear_od();
                                                }

                                            }).catch(function(res) {
                                                AppService.err('getTagByPallet', res);
                                            }).finally(function() {
                                                $ionicLoading.hide();
                                            });
                                        }

                                    }else{
                                        AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ');
                                        Clear_od();
                                    }

                                }).catch(function(res) {
                                    AppService.err('getPallet_No', res);
                                }).finally(function() {
                                    $ionicLoading.hide();
                                });

                            }

                        }).catch(function(res) {
                            AppService.err('chk_Balance_Pallet', res);
                        }).finally(function() {
                            $ionicLoading.hide();
                        });

                    }

                }
                break;
        } //End switch

    };


    /*--------------------------------------
    Change Function
    ------------------------------------- */
    $scope.change = function(dataCh, Position){
        
        if(Position == 'TypeIssue'){
            //Clear_od();
        }else if(Position == 'Shift'){

            if(!dataCh){
                $scope.data.WorkShiftsTime = null;
            }else{

                $ionicLoading.show();
                App.API('getShift', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pstrWhere: " and WorkShifts_Index = '" + dataCh + "'"
                }).then(function(res) {
                    var dataShift = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.data.WorkShiftsTime = dataShift[0].WorkShiftsTime;
                }).catch(function(res) {
                    AppService.err('getShift', res);
                }).finally(function(){
                    $ionicLoading.hide();
                });
            }

        }

    };


    /*--------------------------------------
    Clear Function
    ------------------------------------- */
    $scope.clear = function(){
        $scope.data = {};
        $scope.getBagging = {};
        $scope.getBagging.length = 0;
        AppService.focus('Line');
    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.Pallet){
            AppService.err('', 'กรุณาเลือก Pallet No.', 'Pallet');
            Clear_od();
        }else if($scope.data.IssueQty < 0){
            $scope.data.IssueQty = null;
            AppService.err('', 'กรุณากรอกจำนวนเบิก', 'IssueQty');
        }else if(!$scope.data.Line){
            $scope.data.Line = null;
            AppService.err('', 'กรุณากรอกจำนวนเบิก', 'Line');
        }else if(!$scope.data.Shift){
            $scope.data.Shift = null;
            AppService.err('', 'กรุณาเลืิอก Shift', 'Shift');
        }else if(!$scope.data.StartDate){
            $scope.data.StartDate = null;
            AppService.err('', 'กรุณาเลือกวันที่', 'StartDate');
        }else if(!$scope.data.Location){
            $scope.data.Location = null;
            AppService.err('', 'กรุณากรอก Location', 'Location');
        }else{

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'คุณต้องการยืนยัน ?'
              }).then(function(res) {
                if(!res) {
                  $scope.data.Pallet = null;
                  AppService.focus('Pallet');
                }else {

                    var BagArr = $scope.data.BagOrder.split(',');
                    var DateSelected = $filter('date')($scope.data.StartDate, "dd/MM/yyyy");

                    // console.log('SAVE -------------');
                    // console.log('tag_no = ',$scope.data.TAG_NO);
                    // console.log('line_no = ',$scope.data.Line);
                    // console.log('baggingorder_index = ',BagArr[0]);
                    // console.log('baggingorder_no = ',BagArr[1]);
                    // console.log('shift = ',$scope.data.Shift);
                    // console.log('date_text = ',DateSelected);
                  
                    var splitLine = $scope.data.Line.split("LINE");
                    var Line = splitLine[1];
                    $ionicLoading.show();

                    App.API('insertPDIssueRawMat', {
                        objsession: angular.copy(LoginService.getLoginData()),
                            Line_No: Line,
                            BaggingOrder_Index: BagArr[0],
                            BaggingOrder_No: BagArr[1],
                            WorkShifts_Index: $scope.data.Shift,
                            _Date: DateSelected, 
                            Qty_Begin: $scope.data.QtyBal,
                            Qty_Issue: $scope.data.IssueQty,
                            Tag_No: $scope.data.TAG_NO,
                            Type: $scope.data.TypeIssue,
                            Location: $scope.data.Location
                    }).then(function(res) {
                        AppService.succ('ทำการเบิกเรียบร้อยแล้ว', 'Pallet');
                        Clear_od();
                    }).catch(function(res) {
                        AppService.err('insertPDIssueRawMat', res);
                    }).finally(function() {
                        $ionicLoading.hide();
                    });

                }
            }); //End Popup
        }

    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[Position] = imageData.text.toUpperCase();
                $scope.search(angular.copy($scope.data[Position]), Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


});
