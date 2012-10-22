// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.appMobiDev = function(runtime)
{
	this.runtime = runtime;
};



(function ()
{
	var pluginProto = cr.plugins_.appMobiDev.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;
	
	
	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};
	
	var appMobiEnabled=false;
	var aMObj={};
	var evtRemoteDataResponse='';
	var evtBarCodeResponse='';
	var evtCameraImageURL='';
	var evtConnection='';
	var evtRemoteStatus='idle';
	var accelerometer={x:0,y:0,z:0};
	var aMRuntime = null;
	var aMInst = null;
	var notificationPushQueue=[];
	var notificationPushQueueCount=0;
	var pushFriendUserId='';
	var evtGeoLat=0;
	var evtGeoLong=0;
	
	var deviceHasCaching=false;
	var deviceHasPush=false;
	var deviceHasStreaming=false;
	var deviceHasUpdates=false;
	var deviceOrientation=0;
	var deviceInitialOrientation=0;
	
	var evtAccelX=0;
	var evtAccelY=0;
	var evtAccelZ=0;
	// for executing in webview in DC mode
	var awex = null;
	
	
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;		
	};
	
	//////////////////////////////////////
	// APPMOBI EVENTS
	var amev = {};
	var isDC = false;
	
	amev.getRemoteDataEvent = function(event)
	{
		try {
			if(event.success)
			{
				evtRemoteDataResponse=event.response;
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnRemoteData, aMInst); //aMInst
			}
		} catch(e){}
	};
	
	amev.barcodeScanned = function(evt)
	{
		try {
			if(evt.success)
			{
				evtBarCodeResponse=evt['codedata'];
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnBarcodeScanned, aMInst);
			}
		} catch(e){}
	};
	
	amev.notificationPushReceive=function(evt){
		try {
			if(evt.success)
			{
				notificationPushQueue = aMObj['notification']['getNotificationList'](); 
				notificationPushQueueCount = notificationPushQueue.length; 
				
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushReceive, aMInst);
			}
		} catch(e){}
	}

			
	amev.notificationPushEnabled=function(evt){
		try {
			if(evt.success)
			{
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushEnabled, aMInst);
			}
		} catch(e){}
	}
			
	amev.notificationRichClosed=function(evt){
		try {
			if(evt.id!='')
			{
				if(!isDC){
					aMObj['notification']['deletePushNotifications'](evt.id);
				}
			}
		} catch(e){}
	}
	
	amev.notificationPushUserFound=function(evt){
		try {
			if(evt.success)
			{
				if(!isDC){
					pushFriendUserId=evt.userid;
					aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushUserFound, aMInst);
				}
			}else{
				if(!isDC){
					pushFriendUserId='';
					aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushUserNotFound, aMInst);
				}
			}
		} catch(e){}
	}
	
	amev.notificationPushSent=function(evt){
		try {
			if(evt.success)
			{
				if(!isDC){
					aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationSendSuccess, aMInst);
				}
			}else{
				if(!isDC){				
					aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationSendFail, aMInst);
				}
			}
		} catch(e){}
	}
	
	
	
	amev.connectionUpdate = function(event)
	{
		try {
			if(event.success)
			{
				evtConnection=event.connection;
			}
		} catch(e){}
	};
	
	amev.remoteClosed = function(event)
	{
		try {
			if(event.success)
			{
				evtRemoteStatus='closed';
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnRemoteSiteClosed, aMInst);
			}
		} catch(e){}
	};
	
	amev.onBack = function(event)
	{
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnBack, aMInst);
	};
		
	amev.audioStop=function(){	
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnAudioStop, aMInst);
	};
	
	amev.pictureSuccess=function(evt){		
		try{
			if (evt.success == true){ 			
				evtCameraImageURL=aMObj['camera']['getPictureURL'](evt.filename);				
				if(window['appMobiFileUploadURL'].length>0){					
					aMObj['file']['uploadToServer'](evtCameraImageURL,window['appMobiFileUploadURL'], "", "image/jpeg", "");
				}
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnPictureSuccess, aMInst);
			}
		}catch(e){console.log('pictureSuccess',e);}
	};
	
	amev.uploadComplete=function(evt){		
		try{
			if (evt.success == true){ 
				aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnFileUploaded, aMInst);
			}
		}catch(e){}
	};
	
	amev.geoProcessLocation=function(p){		
		evtGeoLat=p.coords.latitude;
		evtGeoLong=p.coords.longitude;
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnGeoLocationReceived, aMInst);
	};
	amev.geoProcessLocationFail=function(p){
		evtGeoLat=0;
		evtGeoLong=0;
	};
	
	amev.accelSuccess=function(p){
		evtAccelX=p.x;
		evtAccelY=p.y;
		evtAccelZ=p.z;
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnAccellReceived, aMInst);
	};
	amev.accelFail=function(p){
		evtAccelX=0;
		evtAccelY=0;
		evtAccelZ=0;
	};
	
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		aMRuntime = this.runtime;
		aMInst = this;
		isDC = this.runtime.isDirectCanvas;
		
		if (isDC){awex = AppMobi["webview"]["execute"]; }
		
		if (typeof window["AppMobi"] !== "undefined" && !isDC)
		{
			aMObj = window["AppMobi"];
			appMobiEnabled = true;
			
			document.addEventListener("appMobi.device.remote.data", amev.getRemoteDataEvent,false);
			document.addEventListener("appMobi.device.barcode.scan", amev.barcodeScanned, false);
			document.addEventListener("appMobi.device.connection.update", amev.connectionUpdate, false);
			document.addEventListener("appMobi.device.remote.close", amev.remoteClosed, false);
			document.addEventListener("appMobi.device.hardware.back", amev.onBack, false);
			document.addEventListener("appMobi.device.ready", amev.onDeviceReady, false);
						
			//Push Notifications
			document.addEventListener("appMobi.notification.push.enable", amev.notificationPushEnabled, false);
			document.addEventListener("appMobi.notification.push.receive", amev.notificationPushReceive, false);
			document.addEventListener("appMobi.notification.push.rich.close", amev.notificationRichClosed, false);
			document.addEventListener("appMobi.notification.push.user.find", amev.notificationPushUserFound, false);
			document.addEventListener("appMobi.notification.push.send", amev.notificationPushSent, false);
			
			document.addEventListener("appMobi.player.audio.stop", amev.audioStop, false);
			
			document.addEventListener("appMobi.camera.picture.add", amev.pictureSuccess, false);
			document.addEventListener("appMobi.file.upload",amev.uploadComplete,false);
		}
		
		if(isDC){ awex("window['dcGetDeviceInfo']();"); }
		
	};
	
	instanceProto.onLayoutChange = function ()
	{
	};
	
	window['dcDeviceHasCaching']=function (v){ if(v=='true'){ deviceHasCaching=true; }else{ deviceHasCaching=false; } }
	window['dcDeviceHasPush']=function (v){ if(v=='true'){ deviceHasPush=true; }else{ deviceHasPush=false; } }
	window['dcDeviceHasStreaming']=function (v){ if(v=='true'){ deviceHasStreaming=true; }else{ deviceHasStreaming=false; } }
	window['dcDeviceHasUpdates']=function (v){ if(v=='true'){ deviceHasUpdates=true; }else{ deviceHasUpdates=false; } }
	window['dcDeviceOrientation']=function (v){ deviceOrientation=v; }
	window['dcDeviceInitialOrientation']=function (v){ deviceInitialOrientation=v; }
	
	window['dcNotificationEnabled']=function(){
		try{
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushEnabled, aMInst);
		}catch(e){}
	}
	
	
	window['dcNotificationReceived']=function(d){
		try {
			queue=JSON.parse(d);
			notificationPushQueue = queue;
			notificationPushQueueCount = notificationPushQueue.length;
			aMRuntime.trigger(window['cr']['plugins_'].appMobiDev.prototype.cnds.OnNotificationPushReceive, aMInst);
			
		} catch(e){console.log(e);}
	};

	window['dcNotificationRichClosed']=function(id){
		try{
			awex("aMObj['notification']['deletePushNotifications']('"+id+"');");
		}catch(e){}
	};
	
	window['dcNotificationPushUserFound']=function(id){
		try{
			pushFriendUserId=id;
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushUserFound, aMInst);
		}catch(e){}
	};
	
	window['dcNotificationPushUserNotFound']=function(){
		try{
			pushFriendUserId='';
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationPushUserNotFound, aMInst);

		}catch(e){}
	};
	
	window['dcNotificationPushSentSuccess']=function(){
		try{		
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationSendSuccess, aMInst);
		}catch(e){}
	};
	
	
	
	window['dcNotificationPushSentFail']=function(){
		try{		
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnNotificationSendFail, aMInst);
		}catch(e){}
	};
	
	window['dcGetRemoteData']=function(data){
		try{
			evtRemoteDataResponse=decodeURIComponent(data);
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnRemoteData, aMInst); //aMInst
		}catch(e){}
	};
	
	window['amevGeoProcessLocation']=function(lat,lng){
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnGeoLocationReceived, aMInst);
		evtGeoLat=lat;
		evtGeoLong=lng;
	};
	
	window['amevGeoProcessLocationFail']=function(p){}
	
	window['geoWatchTimer']={};
	
	window['amevAccelProcess']=function(x,y, z){
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnAccellReceived, aMInst);
		evtAccelX=x;
		evtAccelY=y;
		evtAccelZ=z;
	};
	
	window['amevGeoProcessLocationFail']=function(p){}
	
	window['amevFileUploaded']=function(){
		try{
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnFileUploaded, aMInst);
		}catch(e){}
	}
	
	window['amevPictureSuccess']=function(img){
		try{
			evtCameraImageURL=img;
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnPictureSuccess, aMInst);
		}catch(e){}
	}
	
	window['dcBarcodeScanned']=function(s){
		try{
			evtBarCodeResponse=s;
			aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnBarcodeScanned, aMInst);
		}catch(e){}
	}
	
	window['accelWatchTimer']={};
	
	window['appMobiFileUploadURL']='';
	

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	/*********************************************************	
		DEVICE
	*********************************************************/	
	cnds.deviceHasCaching = function ()
	{
		if (!appMobiEnabled)
			return false;
		
		if(isDV){
			return deviceHasCaching;
		}else{
			return aMObj['device']['hasCaching'];
		}
	};
	
	cnds.deviceHasPush = function ()
	{
		if (!appMobiEnabled)
			return false;
		
		if(!isDC){		
			return aMObj['device']['hasPush'];
		}else{
			return deviceHasPush;
		}
	};
	
	cnds.deviceHasStreaming = function ()
	{
		if (!appMobiEnabled)
			return false;
		
		if(!isDC){		
			return aMObj['device']['hasStreaming'];
		}else{
			return deviceHasStreaming;
		}
	};
	
	cnds.deviceHasUpdates = function ()
	{
		if (!appMobiEnabled)
			return false;
		if(!isDC){
			return aMObj['device']['hasUpdates'];
		}else{
			return deviceHasUpdates;
		}
	};
	
	cnds.isInAppMobi = function ()
	{
		return appMobiEnabled || isDC;
	};
	
	var orients_array = [0, -90, 90, 180];
	
	cnds.compareOrientation = function (o)
	{
		if (!appMobiEnabled)
			return (o === 0);	// assume portrait when not in appMobi
			
		if(!isDC){
			return orients_array[o] === parseInt(aMObj['device']['orientation']);
		}else{
			return deviceOrientation;
		}
	};
	
	cnds.compareInitialOrientation = function (o)
	{
		if (!appMobiEnabled)
			return (o === 0);	// assume was in portrait when not in appMobi
		
		if(!isDC){
			return orients_array[o] === parseInt(aMObj['device']['initialOrientation']);
		}else{
			return deviceInitialOrientation;
		}
	};
	
	cnds.OnBarcodeScanned = function ()
	{
		return true;
	};
	
	cnds.OnNotificationPushReceive=function(){
		return true;
	};
	
	cnds.OnNotificationPushEnabled=function(){
		return true;
	};
	
	cnds.OnNotificationPushUserFound=function(){
		return true;
	};
	
	cnds.OnNotificationPushUserNotFound=function(){
		return true;
	};
	
	cnds.OnAudioStop=function(){
		return true;
	};
	
	cnds.OnGeoLocationReceived=function(){
		return true;
	};
	
	cnds.OnAccellReceived=function(){
		return true;
	};
	
	cnds.OnFileUploaded=function(){
		return true;
	};
	
	cnds.OnNotificationSendSuccess=function(){
		return true;
	};
	
	cnds.OnNotificationSendFail=function(){
		return true;
	};
	
	cnds.OnRemoteSiteClosed = function ()
	{
		return true;
	};
	
	cnds.OnRemoteData = function ()
	{
		return true;
	};
	
	cnds.OnBack = function ()
	{
		return true;
	};
	
	cnds.OnPictureSuccess = function ()
	{ console.log('picture taken');
		return true;
	};
	
	cnds.OnPictureListLoaded = function ()
	{
		return true;
	};
	
	
	cnds.OnPaymentSuccess = function ()
	{
		return true;
	};

	cnds.OnPaymentCancel = function ()
	{
		return true;
	};
	
	
	////////////////////////////////////// 
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	acts.deviceCloseRemoteSite = function ()
	{
		try {
			if (isDC)
				awex("AppMobi['device']['closeRemoteSite']();");
			else
				aMObj['device']['closeRemoteSite']();
		} catch(e) {}
	};
	acts.deviceGetRemoteData = function (method, url, body, id)
	{
		if (isDC){
			try{
				awex("GetRemoteData('"+ method +"','" + url +"','"+ body +"','"+ id +"');");
			}catch(e){console.log(e);}
		}else{	
			try {
				evtRemoteDataResponse=''; 
				var parameters = new aMObj['Device']['RemoteDataParameters']();
				parameters.url = url;
				parameters.id = id;
				parameters.method = method;
				parameters.body = body;
				aMObj['device']['getRemoteDataExt'](parameters);
			} catch(e) {console.log('grd',e);}
		}
	}
	
	acts.deviceHideSplashScreen = function ()
	{
		try {
			if (isDC)
				awex("AppMobi['device']['hideSplashScreen']();");
			else
				aMObj['device']['hideSplashScreen']();
		} catch(e) {}
	};
	
	acts.deviceManagePower = function (stayOn, pluggedIn)
	{
		try {
			shouldStayOn=false;
			onlyWhenPluggedIn=false;
			
			if(stayOn==0){ shouldStayOn=true; }
			if(pluggedIn==0){ onlyWhenPluggedIn=true; }
			
			if (isDC)
				awex("AppMobi['device']['managePower']("+shouldStayOn+", "+onlyWhenPluggedIn+");");
			else
				aMObj['device']['managePower'](shouldStayOn,onlyWhenPluggedIn);
		} catch(e) {}
	};
	
	
	
	acts.deviceInstallUpdate = function ()
	{
		try {
			if (isDC)
				awex("AppMobi['device']['installUpdate']();");
			else
				aMObj['device']['installUpdate']();
		} catch(e) {}
	};
	
	acts.deviceLaunchExternal = function (url)
	{
		try {
			if (isDC)
				awex("AppMobi['device']['launchExternal']('" + url + "');");
			else
				aMObj['device']['launchExternal'](url);
		} catch(e) {}
	};
	
	acts.deviceMainViewExecute = function (cmd)
	{
		try {
			aMObj['device']['mainViewExecute'](cmd);
		} catch(e) {}
	};
	
	acts.deviceScanBarcode = function ()
	{
		if (isDC){
			awex("AppMobi['device']['scanBarcode']();");
		}else{	
			try {
				evtBarCodeResponse=''; aMObj['device']['scanBarcode']();
			} catch(e) { console.log('Barcode Error',e);}
		}
	};
	
	acts.deviceUpdateConnection = function ()
	{
		if (isDC)
			return;
		
		try {
			evtConnection=''; aMObj['device']['updateConnection']();
		} catch(e) {}
	};
	
	acts.deviceShowRemoteSite = function (url, w, h, px, py, lx, ly)
	{
		try {
			if (isDC){
				awex("AppMobi['device']['showRemoteSiteExt']('"+url+"',"+px+","+py+", "+lx+", "+ly+", "+w+", "+h+");");
			}else{
					evtRemoteStatus='open'; aMObj['device']['showRemoteSiteExt'](url, px, py, lx, ly, w, h);
			}
		} catch(e) {}
	};
	
	acts.deviceSetAutoRotate = function (allow)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['setAutoRotate'](" + (allow ? "true" : "false") + ");");
		else
			aMObj['device']['setAutoRotate'](allow !== 0);
	};
	
	acts.deviceSetRotateOrientation = function (orientation)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['setRotateOrientation'](" + (orientation === 0 ? "'portrait'" : "'landscape'") + ");");
		else
			aMObj['device']['setRotateOrientation'](orientation === 0 ? "portrait" : "landscape");
	};
	
	/*********************************************************	
		GEOLOCATION
	*********************************************************/	
	acts.geoWatchPosition = function (tot, ha)
	{ 
		try {
			if(tot<100){tot=10000;}
			if(ha==0){ ha=true; }else{  ha=false; }
			
			if (isDC){
				awex("window['geoWatchTimer']=AppMobi['geolocation']['watchPosition'](window['wvGeoProcessLocation'],window['wvGeoProcessLocationFail'],{timeout:"+tot+",enableHighAccuracy:"+ha+"});");
			}else{
				window['geoWatchTimer']=aMObj['geolocation']['watchPosition'](amev.geoProcessLocation,amev.geoProcessLocation,{timeout:tot,enableHighAccuracy:ha});
			}
			
		} catch(e) {console.log(e);}
	};
	
	acts.geoGetPosition = function ()
	{ 
		try {
			
			if (isDC){
				awex("AppMobi['geolocation']['getCurrentPosition'](window['wvGeoProcessLocation'],window['wvGeoProcessLocationFail']);");
			}else{
				aMObj['geolocation']['getCurrentPosition'](amev.geoProcessLocation,amev.geoProcessLocation);
			}
			
		} catch(e) {console.log(e);}
	};
	
	
	
	acts.geoStopWatchPosition = function ()
	{ 
		try {
		
			if (isDC){
				awex("AppMobi['geolocation']['clearWatch'](window['geoWatchTimer']);");
			}else{
				aMObj['geolocation']['clearWatch'](window['geoWatchTimer']);
			}
			
		} catch(e) {console.log(e);}
	};
	
	/*********************************************************	
		ACCELEROMETER
	*********************************************************/	
	acts.accelWatch = function (freq, afr)
	{ 
		try {
			if(freq<10){freq=10;}
			if(afr==0){ afr=true; }else{  afr=false; }
			
			if (isDC){
				awex("window['accelWatchTimer']=AppMobi['accelerometer']['watchAcceleration'](window['wvAccelSuccess'],window['wvAccelFail'],{frequency:"+freq+",adjustForRotation:"+afr+"});");
			}else{
				window['accelWatchTimer']=aMObj['accelerometer']['watchAcceleration'](amev.accelSuccess,amev.accelFail,{frequency:freq,adjustForRotation:afr});
			}
			
		} catch(e) {console.log(e);}
	};
	
	acts.accelStop=function(){
		try{
			if (isDC){
				awex("AppMobi['accelerometer']['clearWatch'](window['accelWatchTimer']);");
			}else{
				aMObj['accelerometer']['clearWatch'](window['accelWatchTimer']);
			}
		
		}catch(e){}
	}
	
	acts.accelGet = function ()
	{ 
		try {
			
			if (isDC){
				awex("AppMobi['accelerometer']['getCurrentAcceleration'](window['wvAccelSuccess'],window['wvAccelFail']);");
			}else{
				aMObj['accelerometer']['getCurrentAcceleration'](amev.accelSuccess,amev.accelFail);
			}
			
		} catch(e) {console.log(e);}
	};
	
	
	/*********************************************************	
		CAMERA
		camera.takePicture(quality, saveToLibrary, pictureType);
	*********************************************************/
	
	acts.cameraTake = function (quality, save, uploadUrl)
	{ 
		try {
			var ext='jpg';
			var saveToLibrary=false;
			
			if(save==0){saveToLibrary=true;}
			if(quality<0 || quality>100){quality=70;}
			
			if (isDC){
				awex("window['appMobiFileUploadURL']='"+uploadUrl+"';");
				awex("AppMobi['camera']['takePicture']("+quality+","+saveToLibrary+",'"+ext+"');");
			}else{
				window['appMobiFileUploadURL']=uploadUrl;
				aMObj['camera']['takePicture'](quality,saveToLibrary,ext);
			}
			
		} catch(e) {console.log('Take Picture Error',e);}
	};
	
	acts.cameraGetPictureList=function(){
		if (isDC){
			awex("window['appmobiPictureList']=AppMobi['camera']['getPictureList']();");
		}else{
			window['appmobiPictureList']=aMObj['camera']['getPictureList']();
		}
		aMRuntime.trigger(cr.plugins_.appMobiDev.prototype.cnds.OnPictureListLoaded, aMInst);
	}
	
	acts.cameraDeletePicture=function(fileName){
		try{
			if(fileName.length==0){ return false; }
			
			if (isDC){
				awex("AppMobi['camera']['deletePicture']('"+fileName+"');");
			}else{
				aMObj['camera']['deletePicture'](fileName);
			}
		}catch(e){}
	}
	
	acts.cameraClearPictures=function(){
		try{
					
			if (isDC){
				awex("AppMobi['camera']['clearPictures']();");
			}else{
				aMObj['camera']['clearPictures']();
			}
		}catch(e){}
	}
	
	acts.cameraImportPicture=function(){
		try{
					
			if (isDC){
				awex("AppMobi['camera']['importPicture']();");
			}else{
				aMObj['camera']['importPicture']();
			}
		}catch(e){}
	}
	
	/*********************************************************	
		ANALYTICS
	*********************************************************/		
	acts.analyticsLogEvent=function(event, qs){ 
		try{ 
			event="/application/" + event + ".event";
			
			if (isDC)
				awex("AppMobi['analytics']['logPageEvent']('" + event + "', '" + qs + "', 200, 'GET', 0, 'index.html');");
			else
				aMObj['analytics']['logPageEvent'](event, qs, 200, 'GET', 0, 'index.html'); 
		}catch(e){ console.log(e); }
	};	
	
	
	/*********************************************************	
		NOTIFICATIONS
	*********************************************************/		
	acts.notificationAddPushUser=function(userId, password, email){ 
		try{ 
			
			if(userId.length==0){ console.log('Notification Add Push User Error: User Id is empty'); return; }
			if(password.length==0){ console.log('Notification Add Push User Error: Password is empty'); return; }
			if(email.length==0){ console.log('Notification Add Push User Error: Email is empty'); return; }
		
			userId=userId.replace(/[^a-z0-9]/gi,'');
			password=password.replace(/[^a-z0-9]/gi,'');
						
			if (isDC)
				awex("AppMobi['notification']['addPushUser']('" + userId + "', '" + password + "', '"+email+"');");
			else
				aMObj['notification']['addPushUser'](userId, password, email); 
		}catch(e){ console.log(e); }
	};	
	
	acts.notificationAlert=function(message,title,buttontext){ 
		try{ 
			
			if(message.length==0){ console.log('Notification Alert Error: Message is empty'); return; }
			if(title.length==0){ title='Alert Box'; return; }
			if(buttontext.length==0){ buttontext='OK'; return; }
						
			if (isDC){
				awex("AppMobi['notification']['alert']('" + message + "', '" + title + "', '"+buttontext+"');");
			}else{
				aMObj['notification']['alert'](message,title,buttontext); 
			}
		}catch(e){ console.log(e); }
	};	
	
	
	
	acts.notificationBeep=function(count){ 
		if(count.length==0){count=1;}
		if(count>1){count=1;}
		
		if (isDC){
			awex("AppMobi['notification']['beep']("+count+");");
		}else{
			aMObj['notification']['beep'](count); 
		}

	}
	acts.notificationVibrate=function(){ 
		if (isDC){
			awex("AppMobi['notification']['vibrate']();");
		}else{
			aMObj['notification']['vibrate'](); 
		}
	}
	
	acts.notificationDeleteUser=function(){ 
		if (isDC){
			awex("AppMobi['notification']['deletePushUser']();");
		}else{
			aMObj['notification']['deletePushUser'](); 
		}
	}
	
	acts.notificationSetUserAttributes=function(s1,s2,s3,s4,s5,s6,n1,n2,n3,n4){ 
		if (isDC){
			try{
			obj={
				's1':s1,
				's2':s2,
				's3':s3,
				's4':s4,
				's5':s5,
				's6':s6,
				'n1':n1,
				'n2':n2,
				'n3':n3,
				'n4':n4
			}
			s=JSON.stringify(obj);
			awex("dcNotificationSetUserAttributes('"+s+"');");
			}catch(e){console.log(e);}
		}else{
			var attributes = new aMObj['Notification']['PushUserAttributes']();
			if(s1.length>0){
				if(s1=='*'){ s1=''; }
				attributes.s1 = s1;
			}
			if(s2.length>0){
				if(s2=='*'){ s2=''; }
				attributes.s2 = s2;
			}
			if(s3.length>0){
				if(s3=='*'){ s3=''; }
				attributes.s3 = s3;
			}
			if(s4.length>0){
				if(s4=='*'){ s4=''; }
				attributes.s4 = s4;
			}
			if(s5.length>0){
				if(s5=='*'){ s5=''; }
				attributes.s5 = s5;
			}
			if(s6.length>0){
				if(s6=='*'){ s6=''; }
				attributes.s6 = s6;
			}
			if(n1.length>0){
				if(n1=='*'){ n1=''; }
				attributes.n1 = n1;
			}
			if(n2.length>0){
				if(n2=='*'){ n2=''; }
				attributes.n2 = n2;
			}
			if(n3.length>0){
				if(n3=='*'){ n3=''; }
				attributes.n3 = n3;
			}
			if(n4.length>0){
				if(n4=='*'){ n4=''; }
				attributes.n4 = n4;
			}
	
			aMObj['notification']['setPushUserAttributes'](attributes); 
		}
	}
	
	acts.notificationShowRich=function(i,removeMessage){ 
	
		if(typeof i === 'undefined' ){i=0;}
		if(typeof removeMessage === 'undefined' ){removeMessage='';}
		
		if (isDC){
			awex("AppMobi['notification']['showRichPushViewer']("+notificationPushQueue[i]+", 10, 10, 100, 100, 80, 80);");
		}else{
			aMObj['notification']['showRichPushViewer'](notificationPushQueue[i], 10, 10, 100, 100, 80, 80); 
		}
	}
	
	
	acts.notificationFindUser=function(email){ 
	
		if(typeof email === 'undefined' ){return false;}
		
		if (isDC){
			awex("AppMobi['notification']['findPushUser']('','"+email+"');");
		}else{
			aMObj['notification']['findPushUser']("",email); 
		}
	}
	
	
	acts.notificationSendPush=function(id, message, data){ 
	
		if(typeof id === 'undefined' ){return false;}
				
		if (isDC){
			awex("AppMobi['notification']['sendPushNotification']('"+id+"', '"+message+"', '"+data+"');");
		}else{
			aMObj['notification']['sendPushNotification'](id, message, data); 
		}
		
	}
	
	
	/*********************************************************	
		CACHE
	*********************************************************/
	acts.cacheAddToMediaCache=function(url)
	{
		if (isDC)
			awex("AppMobi['cache']['addToMediaCache']('"+url+"');");
		try{ 
			aMObj['cache']['addToMediaCache'](url); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheClearAllCookies=function()
	{
		if (isDC)
			awex("AppMobi['cache']['clearAllCookies']();");
		try{ 
			aMObj['cache']['clearAllCookies'](); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheClearMediaCache=function()
	{
		if (isDC)
			awex("AppMobi['cache']['clearMediaCache']();");
		try{ 
			aMObj['cache']['clearMediaCache'](); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheRemoveCookie=function(v)
	{
		if (isDC)
			awex("AppMobi['cache']['removeCookie']('"+v+"');");
		try{ 
			aMObj['cache']['removeCookie'](v); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheRemoveFromMediaCache=function(v)
	{
		if (isDC)
			awex("AppMobi['cache']['removeFromMediaCache']('"+v+"');");
		try{ 
			aMObj['cache']['removeFromMediaCache'](v); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheSetCookie=function(name, value, expires)
	{
		if (isDC)
			awex("AppMobi['cache']['setCookie']('"+name+"','"+value+"','"+expires+"');");
		try{ 
			aMObj['cache']['setCookie'](name, value, expires); 
		}catch(e){ console.log(e); }
	}
	
	acts.AddVirtualPage = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
		
		if (isDC)
			awex("AppMobi['device']['addVirtualPage']();");
		else
			aMObj['device']['addVirtualPage']();
	};
	
	acts.RemoveVirtualPage = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['removeVirtualPage']();");
		else
			aMObj['device']['removeVirtualPage']();
	};
	
	
	
	acts.deviceSendSMS = function (bodyText, toNumber)
	{
		if (!appMobiEnabled && !isDC)
			return;
		
		if(bodyText.length==0){ console.log('Device Send SMS Error: Body Text is empty'); return; }
		if(toNumber.length==0){ console.log('Device Send SMS Error: To Number is empty'); return; }
			
		if (isDC){
			awex("AppMobi['device']['sendSMS']("+bodyText, toNumber+");");
		}else{
			aMObj['device']['sendSMS'](bodyText, toNumber);
		}
	};
	
	/*********************************************************	
		AUDIO
	*********************************************************/
	acts.LoadSound = function (sndFile,cnt)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{
		
			if(typeof cnt!='number'){ cnt=1; }
			
			if (isDC){
				try{
					awex("AppMobi['player']['loadSound']('./media/"+sndFile[0]+".m4a', "+cnt+");");
				}catch(e){
					awex("AppMobi['player']['loadSound']('./media/"+sndFile[0]+".ogg', "+cnt+");");
				}				
			}else{
				if(aMObj['device']['platform'].toLowerCase()=='ios'){ 
					aMObj['player']['loadSound']('./media/'+sndFile[0]+'.m4a', cnt);
				}else{ 
					aMObj['player']['loadSound']('./media/'+sndFile[0]+'.ogg', cnt);					
				}
				
			}
		}catch(e){}
	};
	
	
	acts.PlaySound = function (sndFile)
	{
		if (!appMobiEnabled && !isDC){ return;}
		
		try{
			if(typeof sndFile=='object'){ sndFile=sndFile[0];}
			if (isDC){
				try{					
					awex("AppMobi['player']['playSound']('./media/"+sndFile+".m4a');");
				}catch(e){
					awex("AppMobi['player']['playSound']('./media/"+sndFile+".ogg');");
				}
			}else{	
				if(aMObj['device']['platform'].toLowerCase()=='ios'){ 
					aMObj['player']['playSound']('./media/'+sndFile+'.m4a');
				}else{
					aMObj['player']['playSound']('./media/'+sndFile+'.ogg');
				}				
			}
		}catch(e){console.log('playsound error',e);}
	};
	
	acts.StartAudio = function (sndFile, looping)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{
			if(typeof sndFile=='object'){ sndFile=sndFile[0];}

			var boolLoop=true;
			if(looping==0){boolLoop=true;}
			
			if (isDC){			
				try{
					awex("AppMobi['player']['startAudio']('./media/"+sndFile+".m4a',"+boolLoop+");");
				}catch(e){
					awex("AppMobi['player']['startAudio']('./media/"+sndFile+".ogg',"+boolLoop+");");
				}
			}else{
				if(aMObj['device']['platform'].toLowerCase()=='ios'){ 
					aMObj['player']['startAudio']('./media/'+sndFile+'.m4a',boolLoop);				
				}else{ 
					aMObj['player']['startAudio']('./media/'+sndFile+'.ogg',boolLoop);
				}
				
			}
		}catch(e){console.log('startaudio error',e);}
	};
	
	acts.StopAudio = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{		
		if (isDC)
			awex("AppMobi['player']['stopAudio']();");
		else
			aMObj['player']['stopAudio']();
		}catch(e){ console.log('STOP AUDIO ERROR',e);}
	};
	
	acts.ToggleAudio = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{		
		if (isDC)
			awex("AppMobi['player']['toggleAudio']();");
		else
			aMObj['player']['toggleAudio']();
		}catch(e){console.log('TOGGLE AUDIO ERROR',e);}
	};
	
	acts.UnloadAllSounds = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{		
		if (isDC)
			awex("AppMobi['player']['unloadAllSounds']();");
		else
			aMObj['player']['unloadAllSounds']();
		}catch(e){}
	};
	
	acts.UnloadSound = function (sndFile)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		try{		
		if(typeof sndFile=='object'){ sndFile=sndFile[0];}
		if (isDC)
			try{
				awex("AppMobi['player']['unloadSound']('./media/"+sndFile+".m4a',"+boolLoop+");");
			}catch(e){
				awex("AppMobi['player']['unloadSound']('./media/"+sndFile+".ogg',"+boolLoop+");");
			}
		else
			if(aMObj['device']['platform'].toLowerCase()=='ios'){ 
				aMObj['player']['unloadSound']('./media/'+sndFile+'.m4a');
			}else{ 
				aMObj['player']['unloadSound']('./media/'+sndFile+'.ogg');
			}
			
		}catch(e){}
	};
	
	
	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	/*********************************************************	
		DEVICE
	*********************************************************/	
	exps.AppMobiVersion = function(ret){ try{ret.set_string(aMObj['device']['appmobiversion']);}catch(e){ret.set_string('');}	}
	exps.DeviceConnection = function(ret){ try{ret.set_string(aMObj['device']['connection']);}catch(e){ret.set_string('');}	}
	exps.InitialOrientation = function(ret){ try{ret.set_int(parseInt(aMObj['device']['initialOrientation']));}catch(e){ret.set_int(0);}	}
	exps.DeviceLastStation = function(ret){ try{ret.set_string(aMObj['device']['lastStation']);}catch(e){ret.set_string('');}	}
	exps.DeviceModel = function(ret){ try{ret.set_string(aMObj['device']['model']);}catch(e){ret.set_string('');}	}
	exps.Orientation = function(ret){ try{ret.set_int(parseInt(aMObj['device']['orientation']));}catch(e){ret.set_int(0);}	}
	exps.DeviceOSVersion = function(ret){ try{ret.set_string(aMObj['device']['osversion']);}catch(e){ret.set_string('');}	}
	exps.DevicePhonegapVersion = function(ret){ try{ret.set_string(aMObj['device']['phonegapversion']);}catch(e){ret.set_string('');}	}
	exps.DevicePlatform = function(ret){ try{ret.set_string(aMObj['device']['platform']);}catch(e){ret.set_string('');}	}
	exps.DeviceQueryString = function(ret){ try{ret.set_string(aMObj['device']['queryString']);}catch(e){ret.set_string('');}	}
	exps.DeviceUUID = function(ret){ try{ret.set_string(aMObj['device']['uuid']);}catch(e){ret.set_string('');}	}
	exps.DeviceRemoteData = function(ret){ try{ret.set_string(evtRemoteDataResponse);}catch(e){ret.set_string('');}	}
	exps.DeviceBarcodeData = function(ret){ try{ ret.set_string(evtBarCodeResponse);}catch(e){ret.set_string('');} }
	exps.DeviceRemoteStatus = function(ret){ try{ret.set_string(evtRemoteStatus);}catch(e){ret.set_string('');} }
	
	
	/*********************************************************	
		GEOLOCATION
	*********************************************************/
	exps.GeolocationLat = function(ret){ try{ret.set_float(evtGeoLat);}catch(e){ret.set_float(0);} }
	exps.GeolocationLong = function(ret){ try{ret.set_float(evtGeoLong);}catch(e){ret.set_float(0);} }
	
	exps.AccelerationX = function(ret){ try{ret.set_float(evtAccelX);}catch(e){ret.set_float(0);} }
	exps.AccelerationY = function(ret){ try{ret.set_float(evtAccelY);}catch(e){ret.set_float(0);} }
	exps.AccelerationZ = function(ret){ try{ret.set_float(evtAccelZ);}catch(e){ret.set_float(0);} }
	
	/*********************************************************	
		NOTIFICATIONS
	*********************************************************/
	exps.PushNotificationQueueCount = function(ret){ 
		try{
			ret.set_int(notificationPushQueueCount);
		}catch(e){ret.set_int(0);} 
	}
	
	exps.PushNotificationType = function(ret,i){ 
		try{
			if(typeof i === 'undefined' ){i=0;}
			msgObj = aMObj['notification']['getNotificationData'](notificationPushQueue[i]); 
			if (msgObj['isRich'] == false) {
				ret.set_string('plaintext');
			}else{
				ret.set_string('rich');
			}
		}catch(e){ret.set_string(''); console.log(e);}
	}
	
	exps.PushNotificationMessage = function(ret,i, removeMessage){ 
		try{
			if(typeof i === 'undefined' ){i=0;}
			if(typeof removeMessage === 'undefined' ){removeMessage='';}
			var msgObj = aMObj['notification']['getNotificationData'](notificationPushQueue[i]); 

			if (msgObj['isRich']==false) {
				ret.set_string(unescape(msgObj['msg']));	
				if(removeMessage=='remove'){
					aMObj['notification']['deletePushNotifications'](msgObj['id']);
				}
			}else{
				ret.set_string('');
			}
		}catch(e){console.log('MessageError',e);} 
	}
	
	exps.PushNotificationData = function(ret,i,removeMessage){ 
		try{
			if(typeof i === 'undefined' ){i=0;}
			if(typeof removeMessage === 'undefined' ){removeMessage=true;}
			
			msgObj = aMObj['notification']['getNotificationData'](notificationPushQueue[i]); 
			if(msgObj['data']!='null'){
				ret.set_string(msgObj['data']);
				if(removeMessage=='remove'){
					aMObj['notification']['deletePushNotifications'](msgObj['id']);
				}
			}else{
				ret.set_string('');
			}
		}catch(e){ret.set_string('');} 
	}
	
	exps.PushFriendUserId = function(ret){ try{ret.set_string(pushFriendUserId);}catch(e){ret.set_string('');} }
	
	
	
	/*********************************************************	
		CACHE
	*********************************************************/
	exps.Cookie = function(ret, p){ 
		try{
			ret.set_string(aMObj['cache']['getCookie'](p)); 
		}catch(e){ ret.set_string(''); }
	}
	
	exps.LocalMediaCacheURL = function(ret, p){ 
		try{
			ret.set_string(aMObj['cache']['getMediaCacheLocalURL'](p)); 
		}catch(e){ ret.set_string(''); }
	}	
	
	
	/*********************************************************	
		CAMERA 
	*********************************************************/
	exps.PictureListCount = function(ret){ 
		try{
			ret.set_int(window['appmobiPictureList'].length);
		}catch(e){ret.set_int(0);} 
	}
	
	exps.PictureUrl = function(ret,i){ 
		try{
			if(typeof i === 'undefined' ){i=0;}
			ret.set_string(window['appmobiPictureList'][i]);
		}catch(e){ret.set_string(''); console.log(e);}
	}
	
	exps.CurrentPictureUrl=function(ret){
		ret.set_string(evtCameraImageURL);
	}

}());
