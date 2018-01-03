
/**
* Additional.Controllers Module
*
* Description
*/
angular.module('Additional.Controllers', ['ionic'])

.controller('Additional_SumRollCtrl', function($scope, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

	$scope.data = {};
	$scope.dataGridView = {};
	$scope.dataGridView.length = 0;
	var orderitem_index = baggingorderitem_index = sku_index = '';

	$scope.$on('$ionicView.loaded', function() {
        AppService.focus('Pallet');
    });

	

	/*--------------------------------------
    Load GridView Function
    ------------------------------------- */
    var loadGridView = function(dataP){
    	$ionicLoading.show();
		App.API('getGridView_RollToPallet', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            whereSql: dataP
        }).then(function(resGridView) {

        	var dataGridView = (!resGridView['diffgr:diffgram']) ? {} : resGridView['diffgr:diffgram'].NewDataSet.Table1;
        	$scope.dataGridView = dataGridView;
        	$scope.dataGridView.length = Object.keys(dataGridView).length;

        }).catch(function(res) {
            AppService.err('getGridView_RollToPallet', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


	/*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataSearch, Position){

    	switch(Position){
    		case 'Pallet':

    			if(!dataSearch){
    				AppService.err('', 'กรุณาเลือก Pallet', 'Pallet');
    			}else{

	    			$ionicLoading.show();
	    			App.API('chk_Balance_Pallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            pPalletNo: dataSearch 
			        }).then(function(res) {

			            if(res === true){
							$ionicLoading.hide();
			            	AppService.err('', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin');
			            }else{

			            	App.API('get_Current_Pallet', { 
					            objsession: angular.copy(LoginService.getLoginData()), 
					            pPalletNo: dataSearch 
					        }).then(function(resGet) {

					        	var dataGet = (!resGet['diffgr:diffgram']) ? {} : resGet['diffgr:diffgram'].NewDataSet.Table1;
								console.log('get_Current_Pallet -> ',dataGet);
					        	if(Object.keys(dataGet).length > 0){
					        		if(dataGet[0].PalletStatus_id != 'RD'){
					        			$scope.data.Pallet = null;
					        			AppService.err('', 'สถานะ Pallet นี้ ไม่ใช่ RD', 'Pallet');
					        		}else{
					        			AppService.focus('Barcode');
					        		}
					        	}else{
					        		$scope.data.Pallet = null;
					        		AppService.err('', 'ไม่พบ Pallet นี้ในระบบ', 'Pallet');
					        	}

					        }).catch(function(res) {
					            AppService.err('get_Current_Pallet', res);
					        }).finally(function(res) {
					            $ionicLoading.hide();
					        });

			            }
			        }).catch(function(res) {
			            AppService.err('chk_Balance_Pallet', res);
			        }).finally(function(res) {
			            // $ionicLoading.hide();
			        });
			    }

    			break;
    		case 'Barcode':

    			if(!$scope.data.Pallet){
    				AppService.err('', 'กรุณาเลือก Pallet', 'Pallet');
    			}else if(!dataSearch){
    				AppService.err('', 'กรุณาเลือก Barcode', 'Barcode');
    			}else{

    				$ionicLoading.show();
    				var pos = dataSearch.toUpperCase().indexOf("R");
    				var lot = dataSearch.toUpperCase().substring(0, pos).toString();
    				var roll = dataSearch.toUpperCase().substring(pos + 1).toString();


	    			App.API('chk_RollINPallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            whereSql: " and tb_tag.Pallet_No = '" + $scope.data.Pallet + "' and tb_tag.plot = '" + lot + "'and tb_BaggingOrderItem.Roll_No = '" + roll + "' " 
			        }).then(function(resChk) {

			        	var dataChk = (!resChk['diffgr:diffgram']) ? {} : resChk['diffgr:diffgram'].NewDataSet.Table1;
						console.log('chk_RollINPallet -> ',dataChk);
			        	if(Object.keys(dataChk).length > 0){
			        		$scope.data.Grade = dataChk[0].SKU_Id;
			        		$scope.data.Lot = dataChk[0].plot;
			        		$scope.data.Roll = dataChk[0].Roll_No;
			        		$scope.data.Weight = dataChk[0].Weight_Act;
			        		$scope.data.Length = dataChk[0].Total_Qty;
			        		orderitem_index = dataChk[0].OrderItem_Index;
			        		baggingorderitem_index = dataChk[0].DocumentPlanItem_Index;
			        		sku_index = dataChk[0].SKU_Index;
			        		AppService.focus('MoveToPallet');
			        	}else{
			        		$scope.data.Barcode = null;
			        		AppService.err('', 'Roll ที่เลือกไม่ได้อยู่ใน Pallet นี้', 'Barcode');
			        	}
			        }).catch(function(res) {
			            AppService.err('chk_RollINPallet', res);
			        }).finally(function(res) {
			            $ionicLoading.hide();
			        });
			    }

    			break;
    		case 'MoveToPallet':

    			if(!dataSearch){
    				AppService.err('', 'กรุณาเลือก Move To Pallet', 'MoveToPallet');
    			}else{
    				loadGridView(dataSearch);
    			}

    			break;

    	} // End switch

    };


	/*--------------------------------------
    updatePalletCountWeight Function
    ------------------------------------- */
    var updatePalletCountWeight = function(pallet_no, count, weight, fag, sku, plot){
    	$ionicLoading.show();
    	App.API('updatePalletCountWeight', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pallet_no: pallet_no,
            count: parseFloat(count),
            weight: parseFloat(weight),
            fag: fag,
            sku: (sku) ? sku : '',
           	lot: (plot) ? plot : ''
        }).then(function(resPallet) {
        }).catch(function(res) {
            AppService.err('updatePalletCountWeight', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


	/*--------------------------------------
    updatePalletToItem Function
    ------------------------------------- */
    var updatePalletToItem = function(p1, p2, p3){
    	App.API('updatePalletToItem', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            orderitem_index: p1,
            baggingorderitem_index: p2,
            pallet_no: p3
        }).then(function(resChk) {
        	return true;
        }).catch(function(res) {
			AppService.err('updatePalletToItem', res);
            return false;
        }).finally(function(res) {});
    };


	/*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(dataArr){

    	if(!dataArr.MoveToPallet){
    		AppService.err('', 'กรุณาเลือก Move To Pallet', 'MoveToPallet');
    	}else{

			$ionicLoading.show();
			App.API('chk_Balance_Pallet', { 
	            objsession: angular.copy(LoginService.getLoginData()), 
	            whereSql: dataArr.MoveToPallet
	        }).then(function(res) {
				console.log('res = ',res);
	        	if(res === true){
					$ionicLoading.hide();
	            	AppService.err('', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin');
	            }else{
	            	App.API('getPalletInBGPallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            pstrWhere: " AND Pallet_No LIKE '" + dataArr.MoveToPallet + "'" 
			        }).then(function(res) {

			        	var dataGet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
						console.log('res = ',dataGet);

			        	if(Object.keys(dataGet).length > 0){
			        		if(dataGet[0].PalletStatus_Index != '0010000000004' && dataGet[0].PalletStatus_Index != '0010000000000'){
								$ionicLoading.hide();
			        			$scope.data.MoveToPallet = null;
			        			AppService.err('', 'สถานะ Pallet นี้ ไม่ใช่ RD และ EM', 'MoveToPallet');
			        		}else if(dataGet[0].PalletStatus_Index == '0010000000004'){
			        			App.API('chk_RollINPallet', { 
						            objsession: angular.copy(LoginService.getLoginData()), 
						            whereSql: " and tb_tag.Pallet_No = '" + dataArr.MoveToPallet + "'"
						        }).then(function(res) {

						        	var dataChk = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
									console.log('res = ',dataChk);

						        	if(Object.keys(dataChk).length > 0){

										updatePalletToItem(orderitem_index, baggingorderitem_index, dataArr.MoveToPallet);

										var isErr = false;
										App.API('getPalletCountWeight', { 
											objsession: angular.copy(LoginService.getLoginData()), 
											whereStr: dataArr.Pallet
										}).then(function(res) {
											
											var dataPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
											console.log('res = ',dataPallet);
											if(Object.keys(dataPallet).length > 0 && dataPallet[0].Count_Pallet > 0){
												updatePalletCountWeight(dataArr.Pallet, dataPallet[0].Sum_Qty, dataPallet[0].Sum_Weight, 'Start', null, null);
											}else if(Object.keys(dataPallet).length > 0 && dataPallet[0].Count_Pallet == 0){
												updatePalletCountWeight(dataArr.Pallet, 0, 0, 'Start_EM', null, null);
											}else{
												$scope.data.MoveToPallet = null;
												isErr = true;
												$ionicLoading.hide();
												AppService.err('', 'การ Update Pallet ที่จะย้ายไปผิดพลาด', 'MoveToPallet');
											}
											
											if(Object.keys(dataPallet).length > 0){
												updatePalletCountWeight(dataArr.MoveToPallet, dataPallet[0].Sum_Qty, dataPallet[0].Sum_Weight, 'Target', null, null);
											}

										}).catch(function(res) {
											AppService.err('getPalletCountWeight', res);
										}).finally(function(res) {

											if(!isErr){
												loadGridView(dataArr.MoveToPallet);
												$scope.data = {};
												AppService.succ('ทำการย้ายเรียบร้อย', 'Pallet');
											}

										});

						        	}else if(Object.keys(dataChk).length >= 12){
										$ionicLoading.hide();
						        		AppService.err('', 'Pallet นี้  Roll ครบแล้ว', 'MoveToPallet');
						        	}else{
										$ionicLoading.hide();
						        		AppService.err('', 'Pallet ผิดพลาด', 'MoveToPallet');
						        	}
						        }).catch(function(res) {
						            AppService.err('chk_RollINPallet', res);
						        }).finally(function(res) {
						        });

			        		}else{

								updatePalletToItem(orderitem_index, baggingorderitem_index, dataArr.MoveToPallet);

								var isErr2 = false;
								App.API('getPalletCountWeight', { 
									objsession: angular.copy(LoginService.getLoginData()), 
									whereStr: dataArr.Pallet
								}).then(function(res) {
									
									var dataPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
									if(Object.keys(dataPallet).length > 0 && dataPallet[0].Count_Pallet > 0){
										updatePalletCountWeight(dataArr.Pallet, dataPallet[0].Sum_Qty, dataPallet[0].Sum_Weight, 'Start' , null, null);
									}else if(Object.keys(dataPallet).length > 0 && dataPallet[0].Count_Pallet == 0){
										updatePalletCountWeight(dataArr.Pallet, 0, 0, 'Start_EM', null, null);
									}else{
										$scope.data.MoveToPallet = null;
										isErr2 = true;
										AppService.err('', 'การ Update Pallet ที่จะย้ายไปผิดพลาด', 'MoveToPallet');
									}
									
									if(Object.keys(dataPallet).length > 0){
										updatePalletCountWeight(dataArr.MoveToPallet, dataPallet[0].Sum_Qty, dataPallet[0].Sum_Weight, 'Target_EM' , sku_index, $scope.data.Lot);
									}

								}).catch(function(res) {
									AppService.err('getPalletCountWeight', res);
								}).finally(function(res) {

									if(!isErr2){
										loadGridView(dataArr.MoveToPallet);
										$scope.data = {};
										AppService.succ('ทำการย้ายเรียบร้อย', 'Pallet');
									}

								});

			        		}

			        	}else{
			        		$scope.data.MoveToPallet = null;
			        		AppService.err('', 'ไม่พบเอกสารอ้างอิง Pallet นี้', 'MoveToPallet');
			        	}

			        }).catch(function(res) {
			            AppService.err('getPalletInBGPallet', res);
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
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[Position] = imageData.text.toUpperCase();
                $scope.search($scope.data[Position], Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


	
})

.controller('Additional_MovePalletCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $timeout) {
  
  	$scope.data = {};
  	$scope.dataTable1 = {};
  	$scope.dataTable2 = {};
  	$scope.dataTable1.length = 0;
  	$scope.dataTable2.length = 0;
  	var sku_index = lot = baggingorderitem_index = '';
	$scope.updatePalletCountWeight_Success = '';

  	$scope.$on('$ionicView.loaded', function() {
        AppService.focus('Pallet');
    });


	/*--------------------------------------
    loadGridTable Function
    ------------------------------------- */
    var loadGridTable = function(Posi){
    	$ionicLoading.show();
    	App.API('getGridView_ChangePallet', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            whereSql: $scope.data[Posi]
        }).then(function(resGridView) {

        	var dataGridView = (!resGridView['diffgr:diffgram']) ? {} : resGridView['diffgr:diffgram'].NewDataSet.Table1;
        	if(Posi == 'Pallet'){
        		$scope.dataTable1 = dataGridView;
        		$scope.dataTable1.length = Object.keys(dataGridView).length;
        	}

        	if(Posi == 'ChangeToPallet'){
        		$scope.dataTable2 = dataGridView;
        		$scope.dataTable2.length = Object.keys(dataGridView).length;
        		$scope.dataTable1 = {};
        		$scope.dataTable1.length = 0;
        		$scope.data.Pallet = null;
        		$scope.data.ChangeToPallet = null;
        		AppService.focus('Pallet');
        	}        	

        }).catch(function(res) {
            AppService.err('getGridView_ChangePallet', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };


	/*--------------------------------------
    updatePalletCountWeight Function
    ------------------------------------- */
    var updatePalletCountWeight = function(pallet_no, count, weight, fag, sku, plot){
    	$ionicLoading.show();
    	App.API('updatePalletCountWeight', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pallet_no: pallet_no,
            count: parseFloat(count),
            weight: parseFloat(weight),
            fag: fag,
            sku: (sku) ? sku : '',
           	lot: (plot) ? plot : ''
        }).then(function(res) {
			console.log('updatePalletCountWeight Success',res);
        }).catch(function(res) {
            AppService.err('updatePalletCountWeight', res);
        }).finally(function(res) {
			console.log('updatePalletCountWeight finally',res);
            // $ionicLoading.hide();
        });
    };


	/*--------------------------------------
    updatePalletToItem Function
    ------------------------------------- */
    var updatePalletToItem = function(p1, p2, p3){
    	App.API('updatePalletToItem', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            orderitem_index: p1,
            baggingorderitem_index: p2,
            pallet_no: p3
        }).then(function(resChk) {
        	return true;
        }).catch(function(res) {
			AppService.err('updatePalletToItem', res);
            return false;
            
        }).finally(function(res) {});
    };


	/*--------------------------------------
    changePallet Function
    ------------------------------------- */
    var changePallet = function(){

    	var isEr = false;
    	if($scope.data.Pallet == $scope.data.ChangeToPallet){
    		isEr = true;
			$scope.data.ChangeToPallet = null;
			AppService.err('', 'Pallet ต้นทางซ้ำ กับ Pallet ที่จะย้ายไป', 'ChangeToPallet');
		}

		if(!isEr){
			$ionicPopup.confirm({
			    title: 'Confirm',
			    template: 'ยืนยันการย้ายหรือไม่ ?'
			}).then(function(res) {
			    if(!res) {
			      	$scope.data.ChangeToPallet = null;
			      	AppService.focus('ChangeToPallet');
			    } else {
			    	$ionicLoading.show();
			      	App.API('getTagByPallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            pPallet_No: $scope.data.Pallet
			        }).then(function(res) {

			        	var dataGet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
						var dataGet_Length = Object.keys(dataGet).length;
						console.log('res = ',dataGet);
			        	if(dataGet_Length > 0){

			        		sku_index = dataGet[0].Sku_Index_T;
			        		lot = dataGet[0].PLot;

			        		$ionicLoading.show();
			        		App.API('getBaggingOrderItem', { 
					            objsession: angular.copy(LoginService.getLoginData()), 
					            pstrWhere: " and BaggingOrderItem_Index = (select DocumentPlanItem_Index from tb_OrderItem where OrderItem_Index = '" + dataGet[0].OrderItem_Index + "')" 
					        }).then(function(odt_bg) {

					        	var dataBagging = (!odt_bg['diffgr:diffgram']) ? {} : odt_bg['diffgr:diffgram'].NewDataSet.Table1;
								console.log('res = ',dataBagging);

					        	if(Object.keys(dataBagging).length > 0){
									baggingorderitem_index = dataBagging[0].BaggingOrderItem_Index;
								}else{
									baggingorderitem_index = '';
								}

								for(var i = 0 ; dataGet_Length > i ; i ++){
									updatePalletToItem(dataGet[i].TAG_No, baggingorderitem_index, $scope.data.ChangeToPallet);
								}

								$ionicLoading.show();
								App.API('getTagByPallet_SumTag', { 
									objsession: angular.copy(LoginService.getLoginData()), 
									pPallet_No: $scope.data.ChangeToPallet 
								}).then(function(resGetTag) {

									var dataGetTag = (!resGetTag['diffgr:diffgram']) ? {} : resGetTag['diffgr:diffgram'].NewDataSet.Table1;
									console.log('res = ',dataGetTag);
									
									if(Object.keys(dataGetTag).length > 0){
										updatePalletCountWeight($scope.data.ChangeToPallet, dataGetTag[0].Qty_Tag, dataGetTag[0].Weight_Tag, 'Target_EM', sku_index, lot);
										
										$timeout(function() {
											updatePalletCountWeight($scope.data.Pallet, 0, 0, 'Start_EM', '', '');
											console.log('update with timeout fired')
											$ionicLoading.hide();
											AppService.succ('ย้าย Pallet เรียบร้อย');
											loadGridTable('ChangeToPallet');
										}, 5000);
										
									}else{
										$ionicLoading.hide();
									}

								}).catch(function(res) {
									AppService.err('getTagByPallet_SumTag', res);
								}).finally(function(res) {
								});
					        		

					        }).catch(function(res) {
					            AppService.err('getBaggingOrderItem', res);
					        }).finally(function(res) {
					        });

			        	}else{
			        		$scope.data.ChangeToPallet = null;
			        		baggingorderitem_index = sku_index = lot = '';
			        		AppService.focus('ChangeToPallet');
			        	}

			        }).catch(function(res) {
			            AppService.err('getTagByPallet', res);
			        }).finally(function(res) {
			            $ionicLoading.hide();
			        });
			    }
			});
		}

    };


	/*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataSearch, Position){

    	switch(Position){
    		case 'Pallet':

	    		if(!dataSearch){
					AppService.err('', 'กรุณาเลือก Pallet', 'Pallet');
				}else{

					$ionicLoading.show();
	    			App.API('chk_Balance_Pallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            pPalletNo: dataSearch
			        }).then(function(res) {

			            if(res === true){
			            	$scope.data.Pallet = null;
			            	AppService.err('', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin', 'Pallet');
			            }else{

			            	App.API('get_Current_Pallet', { 
					            objsession: angular.copy(LoginService.getLoginData()), 
					            pPalletNo: dataSearch 
					        }).then(function(resGet) {

					        	var dataGet = (!resGet['diffgr:diffgram']) ? {} : resGet['diffgr:diffgram'].NewDataSet.Table1;
					        	if(Object.keys(dataGet).length > 0){
					        		if(Object.keys(dataGet[0]).length > 0){
					        			if(dataGet[0].PalletStatus_id != 'RD' && dataGet[0].PalletStatus_id != 'PD'){
											$ionicLoading.hide();
						        			$scope.data.Pallet = null;
						        			$scope.dataTable1.length = 0;
						        			$scope.dataTable1 = {};
						        			AppService.err('', 'สถานะ Pallet นี้ ไม่ใช่ RD หรือ PD', 'Pallet');
						        		}else{

						        			App.API('getTagByPallet', { 
									            objsession: angular.copy(LoginService.getLoginData()), 
									            pPallet_No: dataSearch 
									        }).then(function(resGet) {

									        	var dataGet = (!resGet['diffgr:diffgram']) ? {} : resGet['diffgr:diffgram'].NewDataSet.Table1;
									        	if(Object.keys(dataGet).length > 0){
									        		$scope.dataTable2.length = 0;
						        					$scope.dataTable2 = {};
						        					loadGridTable(Position);
						        					AppService.focus('ChangeToPallet');
									        	}else{
													$ionicLoading.hide();
									        		$scope.data.Pallet = null;
									        		$scope.dataTable1.length = 0;
						        					$scope.dataTable1 = {};
									        		AppService.err('', 'Pallet นี้ไม่มีใน Stock', 'Pallet');
									        	}

									        }).catch(function(res) {
									            AppService.err('getTagByPallet', res);
									        }).finally(function(res) {
									            // $ionicLoading.hide();
									        });
						        		}
					        		}else{
					        			$scope.data.Pallet = null;
					        			AppService.err('', 'ไม่พบเอกสารอ้างอิง Pallet นี', 'Pallet');
					        		}
					        	}else{
									$ionicLoading.hide();
					        		$scope.data.Pallet = null;
					        		AppService.err('', 'ไม่พบ Pallet นี้ในระบบ', 'Pallet');
					        	}

					        }).catch(function(res) {
					            AppService.err('get_Current_Pallet', res);
					        }).finally(function(res) {
					            //$ionicLoading.hide();
					        });

			            }
			        }).catch(function(res) {
			            AppService.err('chk_Balance_Pallet', res);
			        }).finally(function(res) {
			            // $ionicLoading.hide();
			        });
				}

	    		break;
    		case 'ChangeToPallet':

    			if(!$scope.data.Pallet){
					AppService.err('', 'กรุณาเลือก Pallet', 'Pallet');
				}else if(!dataSearch){
					AppService.err('', 'กรุณาเลือก Change To Pallet', 'ChangeToPallet');
				}else{

					$ionicLoading.show();
					App.API('chk_Balance_Pallet', { 
			            objsession: angular.copy(LoginService.getLoginData()), 
			            pPalletNo: dataSearch 
			        }).then(function(res) {

			            if(res === true){
							$ionicLoading.hide();
			            	$scope.data.ChangeToPallet = null;
			            	AppService.err('', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin', 'ChangeToPallet');
			            }else{

			            	App.API('get_Current_Pallet', { 
					            objsession: angular.copy(LoginService.getLoginData()), 
					            pPalletNo: dataSearch 
					        }).then(function(resGet) {

					        	var dataGet = (!resGet['diffgr:diffgram']) ? {} : resGet['diffgr:diffgram'].NewDataSet.Table1;
					        	if(Object.keys(dataGet).length > 0){
					        		if(Object.keys(dataGet[0]).length > 0){
					        			if(dataGet[0].PalletStatus_id != 'EM' && dataGet[0].PalletStatus_id != 'RD' && dataGet[0].PalletStatus_id != 'PD'){
											$ionicLoading.hide();
						        			$scope.data.ChangeToPallet = null;
						        			$scope.dataTable1.length = 0;
						        			$scope.dataTable1 = {};
						        			AppService.err('', 'สถานะ Pallet นี้ ไม่ใช่ RD,PD หรือ EM', 'ChangeToPallet');
						        		}else{
						        			changePallet();
						        		}
					        		}else{
					        			$scope.data.ChangeToPallet = null;
					        			AppService.err('', 'ไม่พบเอกสารอ้างอิง Pallet นี', 'ChangeToPallet');
					        		}
					        	}else{
									$ionicLoading.hide();
					        		$scope.data.ChangeToPallet = null;
					        		AppService.err('', 'ไม่พบ Pallet นี้ในระบบ', 'ChangeToPallet');
					        	}

					        }).catch(function(res) {
					            AppService.err('get_Current_Pallet', res);
					        }).finally(function(res) {
					            $ionicLoading.hide();
					        });

			            }
			        }).catch(function(res) {
			            AppService.err('chk_Balance_Pallet', res);
			        }).finally(function(res) {
			        });
				}

    			break;
    	}

    };


	/*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){
    	$scope.search($scope.data.ChangeToPallet, 'ChangeToPallet');
    };


	/*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(Position) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data[Position] = imageData.text.toUpperCase();
                $scope.search($scope.data[Position], Position);
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})

.controller('Additional_MoveLocationCtrl', function($scope, $ionicPopup, $filter, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {
  
  	$scope.data = {};
  	$scope.GetStatusItem = {};
  	$scope.GetStatusItem.length = 0;  	
  	$scope.GetStatusPallet = {};
  	$scope.GetStatusPallet.length = 0;

  	$ionicLoading.show();
  	App.API('GetStatusItem', { 
  		objsession: angular.copy(LoginService.getLoginData())
  	}).then(function(res) {
        $scope.GetStatusItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.GetStatusItem.length = Object.keys($scope.GetStatusItem).length;
    }).catch(function(res) {
        AppService.err('GetStatusItem', res);
    }).finally(function(res) {

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

    });


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
						console.log('saveRelocateONLY_Pallet -> ',resSave);
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
    Scan Barcode Function
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

.controller('Additional_CheckRollPalletCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {
  

	/*--------------------------------------
    clearData Function
    ------------------------------------- */
  	var clearData = function(){
	  	$scope.data = {};
		$scope.ItemList = {};
		$scope.ItemList.length = 0;
	};

	clearData();


	/*--------------------------------------
    dataGride Function
    ------------------------------------- */
    var dataGride = function(str, dataS, pos){
    	var lot1 = dataS.substring(0, pos);
        var roll1 = dataS.substring(pos + 1);

    	App.API('getData_PalletRoll', { 
	  		objsession: angular.copy(LoginService.getLoginData()),
	  		barcode: dataS,
	  		fag: str,
	  		type: 'view',
	  		lot: lot1,
	  		roll: roll1
	  	}).then(function(res) {
	  		console.log('res =',res);

	        var getDataList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
        	$scope.ItemList = getDataList;
			$scope.ItemList.length = Object.keys(getDataList).length;
	        
	    }).catch(function(res) {
	        AppService.err('getData_PalletRoll', res);
	    }).finally(function(res) {

	    	$ionicLoading.hide();
	    	$scope.data.Barcode = null;
    		AppService.focus('Barcode');

	    });

    };


	/*--------------------------------------
    setValues Function
    ------------------------------------- */
    var setValues = function(getData){
    	$scope.data.Roll = getData.Roll_No;
    	$scope.data.Lot = getData.Lot;
    	$scope.data.Description = getData.Grade;
    	$scope.data.PDNo = getData.PD_No;
    	$scope.data.OrderNo = getData.Order_No;
    	$scope.data.TotalQty = getData.Qty;
    	$scope.data.Weight = getData.Weight;
    	$scope.data.Pallet = getData.Pallet_No;
    	$scope.data.Status = getData.Status;
    	$scope.data.Lolation = getData.Location;
    	$scope.data.Owner = getData.Owner;
    };


	/*--------------------------------------
    Check_Roll Function
    ------------------------------------- */
    var Check_Roll = function(dataS, pos){
		var lot = dataS.substring(0, pos);
        var roll = dataS.substring(pos + 1);

        $ionicLoading.show();
	  	App.API('getData_PalletRoll', { 
	  		objsession: angular.copy(LoginService.getLoginData()),
	  		barcode: dataS,
	  		fag: 'WH',
	  		type: 'roll',
	  		lot: lot,
	  		roll: roll
	  	}).then(function(res) {
	  		// console.log(res, lot, roll);
	        var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
			console.log('getData_PalletRoll -> ',getData);
	        if(Object.keys(getData).length > 0){
	        	setValues(getData[0]);
				$ionicLoading.hide();
	        }else{

	        	App.API('getData_PalletRoll', { 
			  		objsession: angular.copy(LoginService.getLoginData()),
			  		barcode: dataS,
			  		fag: 'PD',
			  		type: 'roll',
			  		lot: lot,
			  		roll: roll
			  	}).then(function(res) {

			        var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
					console.log('getData_PalletRoll (getData).length < 0 ->',getData);
			        if(Object.keys(getData).length > 0){
			        	setValues(getData[0]);
			        }else{
			        	clearData();
			        	AppService.err('', 'ไม่มีเอกสารอ้างอิง Roll No. นี้', 'Barcode');
			        }
			    }).catch(function(res) {
			        AppService.err('getData_PalletRoll', res);
			    }).finally(function(res) {
			    	$ionicLoading.hide();
			    });
	        }
	    }).catch(function(res) {
	        AppService.err('getData_PalletRoll', res);
	    }).finally(function(res) {
	    	//$ionicLoading.hide();
	    });

    };


	/*--------------------------------------
    Check_Pallet Function
    ------------------------------------- */
    var Check_Pallet = function(dataS, pos){
    	var lot = dataS.substring(0, pos);
        var roll = dataS.substring(pos + 1);

    	$ionicLoading.show();
    	App.API('chk_Balance_Pallet', { 
	  		objsession: angular.copy(LoginService.getLoginData()),
	  		pPalletNo: dataS
	  	}).then(function(resChk) {

	  		if(resChk === true){
	  			$scope.data.Barcode = null;
	  			AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'Barcode');
	  		}else{

	  			App.API('getPallet_No', { 
			  		objsession: angular.copy(LoginService.getLoginData()),
			  		pPallet_No: dataS
			  	}).then(function(resPallet) {

			  		var dataPallet = (!resPallet['diffgr:diffgram']) ? {} : resPallet['diffgr:diffgram'].NewDataSet.Table1;
					  console.log('res = ',dataPallet);
			  		if(Object.keys(dataPallet).length <= 0){
						$ionicLoading.hide();
						$scope.data.Barcode = null;
						AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'Barcode');
			  		}else{

			  			App.API('getData_PalletRoll', { 
					  		objsession: angular.copy(LoginService.getLoginData()),
					  		barcode: dataS,
					  		fag: 'WH',
					  		type: 'pallet',
					  		lot: lot,
					  		roll: roll
					  	}).then(function(res) {

					        var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
							console.log('res = ',getData);
					        if(Object.keys(getData).length > 0){
					        	setValues(getData[0]);
					        	dataGride('WH', dataS, pos);
					        }else{

					        	App.API('getData_PalletRoll', { 
							  		objsession: angular.copy(LoginService.getLoginData()),
							  		barcode: dataS,
							  		fag: 'PD',
							  		type: 'roll',
							  		lot: lot,
							  		roll: roll
							  	}).then(function(res) {

							        var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
							        if(Object.keys(getData).length > 0){
							        	setValues(getData[0]);
							        	dataGride('PD', dataS, pos);
							        }else{

							        	App.API('getData_PalletRoll', { 
									  		objsession: angular.copy(LoginService.getLoginData()),
									  		barcode: dataS,
									  		fag: 'EM',
									  		type: 'roll',
									  		lot: lot,
									  		roll: roll
									  	}).then(function(res) {

									        var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
									        if(Object.keys(getData).length > 0){
									        	setValues(getData[0]);
									        	dataGride('TW', dataS, pos);
									        }else{
									        	clearData();
									        	AppService.err('', 'ไม่มีเอกสารอ้างอิง Roll No. นี้', 'Barcode');
									        }
									    }).catch(function(res) {
									        AppService.err('getData_PalletRoll', res);
									    }).finally(function(res) {
									    	$ionicLoading.hide();
									    });
							        }
							    }).catch(function(res) {
							        AppService.err('getData_PalletRoll', res);
							    }).finally(function(res) {
							    });
					        }
					    }).catch(function(res) {
					        AppService.err('getData_PalletRoll', res);
					    }).finally(function(res) {
					    });

			  		}
			        
			    }).catch(function(resChk) {
			        AppService.err('getPallet_No', resChk);
			    }).finally(function(res) {
			    });

	  		}
	        
	    }).catch(function(resChk) {
	        AppService.err('chk_Balance_Pallet', resChk);
	    }).finally(function(res) {
	    });

    };


	/*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(dataSearch){
    	if(!dataSearch){
    		clearData();
			AppService.err('', 'กรุณา Scan Barcode', 'Barcode');
		}else{
			var pos = dataSearch.indexOf("R");
			console.log('pos = ',pos);
			if(pos != -1)
				Check_Roll(dataSearch, pos);
			else
				Check_Pallet(dataSearch, pos);
		}

    };


	/*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
  	$scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.Barcode = imageData.text.toUpperCase();
                $scope.search(angular.copy($scope.data.Barcode));
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


    
	$scope.clear = function(){
		clearData();
    };
		
  
})

.controller('Additional_CheckLocationCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {
  
	$scope.data = {};
	$scope.ItemList = {};
	$scope.ItemList.length = 0;


	/*--------------------------------------
    Search Function
    ------------------------------------- */
	$scope.search = function(dataSearch){
		
		if(!dataSearch){
			$scope.data.Location1 = null;
			AppService.err('', 'กรุณาเลือก Location', 'Location1');
		}else{

			$scope.data.Lolation2 = dataSearch;

			$ionicLoading.show();
		  	App.API('GetLocation_Index', { 
		  		objsession: angular.copy(LoginService.getLoginData()),
		  		pstrLocation: dataSearch
		  	}).then(function(res) {
		        
		        if(res){

		        	App.API('getGridView_Location', { 
				  		objsession: angular.copy(LoginService.getLoginData()),
				  		location_index: res
				  	}).then(function(res) {
				        
				        var GridView = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
				        $scope.ItemList = GridView;
  						$scope.ItemList.length = Object.keys(GridView).length;
  						$scope.data.Lolation1 = null;
  						AppService.focus('Location1');
  						if(Object.keys(GridView).length <= 0){
  							$scope.data = {};
  							AppService.err('', 'Location นี้ไม่มีสินค้', 'Location1');
  						}
				       
				    }).catch(function(res) {
				        AppService.err('getGridView_Location', res);
				    }).finally(function(res) {
				    	$ionicLoading.hide();
				    });

		        }else{
					$ionicLoading.hide();
		        	$scope.data = {};
		        	AppService.err('', 'ไม่มี Location นี้ในระบบ', 'Location1');
		        }
		    }).catch(function(res) {
		        AppService.err('GetLocation_Index', res);
		    }).finally(function(res) {
		    });

		}

	};


  	/*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
	$scope.scanBarcode = function() {
	    $cordovaBarcodeScanner.scan().then(function(imageData) {
	        if (!imageData.cancelled){
	            $scope.data.Lolation1 = imageData.text.toUpperCase();
	            $scope.search(angular.copy($scope.data.Lolation1));
	        }
	    }, function(error) {
	        AppService.err('scanBarcode', error);
		});
	};


});