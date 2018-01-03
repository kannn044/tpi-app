
/**
* Login.Controllers Module
*
* Description
*/
angular.module('Login.Controllers', ['ionic'])

.controller('LoginCtrl', function($filter,$ionicPlatform, $scope, $state, $ionicHistory, App, md5, $ionicPopup, $cordovaKeyboard, $ionicLoading, LoginService, AppService) {


  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();
  LoginService.clearValueLoginData();
  $scope.isFocus = true;
  
  // var res = '{"Table1":[{ "t1": "1234","t2": "aaaaa"}]}';
  // console.log(res);
  // var obj = JSON.parse(res);
  // console.log(obj);
  //  var dataTag = obj.Table1;
  //  console.log(dataTag.length);

  $scope.$on('$ionicView.enter', function() {
    inputFocus();
  });
  $ionicLoading.show();
  App.API('LoadBranch').then(function(res){
    $scope.loadBranchList = (!res['diffgr:diffgram'])? {} : res['diffgr:diffgram'].NewDataSet.Table1;
  }).catch(function(res){
    $ionicLoading.hide();
    APIError(res);
  }).finally(function(res){
    $ionicLoading.hide();
    inputFocus();
  });

  $scope.login = function(login){
    $ionicLoading.show();
    if(!login.username || !login.database){
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Error',
        template: 'รหัสไม่ถูกต้อง'
      }).then(function(res) {
        inputFocus();
        $scope.isFocus = true;
      });
    }else{

      // var md5Pass = md5.createHash(login.pass || '');
    var tempUsr = login.username.split("_");
    var usr = null;
    var pwd = null;
      console.log('tempUsr:::');
    if(tempUsr.length==2){
       usr = tempUsr[0];
       pwd = md5.createHash(tempUsr[1] || '');
       console.log('usr:',usr);
       console.log('pwd:',pwd);
    }else{
      $ionicPopup.alert({
        title: 'Error',
        template: 'กรุณากรอกข้อมูลผู้ใช้ให้ถูกต้อง'
      }).then(function(res) {
        inputFocus();
        $scope.isFocus = true;
      });
      $ionicLoading.hide();
      return;
    }
      App.API('CheckUser', {
        UserName: usr,
        Password: pwd

        //UserName: 'admin',
        //Password: '0EF35D4CD2027A1E54DAC7C588F62792'
        // UserName: 'sasiwan',
        // Password: '81DC9BDB52D04DC20036DBD8313ED055'
        // UserName: 'iceadmin',
        // Password: '0EF35D4CD2027A1E54DAC7C588F62792'
      }).then(function(res){

        var checkUser = res['diffgr:diffgram'];

        if(!checkUser){
          $ionicPopup.alert({
            title: 'Error',
            template: 'รหัสไม่ถูกต้อง'
          }).then(function(res) {
            inputFocus();
            $scope.isFocus = true;
          });
          $ionicLoading.hide();
        }else{

          App.API('SelectDB', {Branch_Id: login.database}).then(function(resSelectDB){

            checkUser = res['diffgr:diffgram'].NewDataSet.Table1[0];

            /* Set Global Dataset*/
            LoginService.setLoginData('Version', '3.5.208.30');
            LoginService.setLoginData('Branch_ID', login.database);
            LoginService.setLoginData('ConnectionStr', resSelectDB);
            LoginService.setLoginData('Userindex', checkUser.user_index);
            LoginService.setLoginData('Username', checkUser.userName);
            LoginService.setLoginData('UserFullName', checkUser.userFullName);
            LoginService.setLoginData('Group_index', (!checkUser.group_index)? '00000' : checkUser.group_index);
            LoginService.setLoginData('Status_id', checkUser.status_id);
            LoginService.setLoginData('Department_Index', checkUser.Department_Index);
            // LoginService.setLoginData('Host_Name', null);
            // LoginService.setLoginData('Host_IP', null);
            // console.log('LoginData==', angular.toJson(LoginService.LoginData,true));
            $state.go('app', {'menuPage':'app', 'namePage':'Main Menu'}); //MainMenu

          }).catch(function(resSelectDB){
            APIError(resSelectDB);
          }).finally(function(resSelectDB){});
          $ionicLoading.hide();
        }

      }).catch(function(res){
        APIError(res);
      }).finally(function(res){});
      
    }
  };

  $scope.exit = function(){
    ionic.Platform.exitApp();
  };

  function APIError(err){
    $ionicPopup.alert({
      title: 'Error',
      template: angular.toJson(err, true)
    }).then(function(err) {
    });
  }

  function inputFocus(){
    AppService.focus('input-username');
    /*if(window.cordova && window.cordova.plugins.Keyboard)
      cordova.plugins.Keyboard.show();
    // $cordovaKeyboard.show();
    // $scope.$broadcast('$cordovaKeyboard:show');*/
  }

 

 /**- Debug   
  * Me.pos = txtUserName.Text.ToString().IndexOf("_")
  * Me.user = txtUserName.Text.ToString().Substring(0, Me.pos()).ToString  
  * Me.pass = txtUserName.Text.ToString().Substring(Me.pos() + 1).ToString 
  */
  
  /**
   * set Password to MD5
   * Web Service call SelectDB(Branch_ID) and keep String Connectionbuffer
   */



});
