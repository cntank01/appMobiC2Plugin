// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.appMobi = function(runtime)
{
	this.runtime = runtime;
};



(function ()
{
	var pluginProto = cr.plugins_.appMobi.prototype;
		
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
	var appMobiObj={};
	var evtRemoteDataResponse='';
	var evtBarCodeResponse='';
	var evtConnection='';
	var evtRemoteStatus='idle';
	var accelerometer={x:0,y:0,z:0};
	var appMobiRuntime = null;
	var appMobiInst = null;
	var notificationPushQueue=[];
	var notificationPushQueueCount=0;
	var pushFriendUserId='';
	
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
				appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnRemoteData, appMobiInst); //appMobiInst
			}
		} catch(e){}
	};
	
	amev.barcodeScanned = function(evt)
	{
		try {
			if(evt.success)
			{
				evtBarCodeResponse=evt['codedata'];
				appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnBarcodeScanned, appMobiInst);
			}
		} catch(e){}
	};
	
	amev.notificationPushReceive=function(evt){
		try {
			if(evt.success)
			{
				notificationPushQueue = appMobiObj['notification']['getNotificationList'](); 
				notificationPushQueueCount = notificationPushQueue.length; 
				
				appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushReceive, appMobiInst);
			}
		} catch(e){}
	}

			
	amev.notificationPushEnabled=function(evt){
		try {
			if(evt.success)
			{
				appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushEnabled, appMobiInst);
			}
		} catch(e){}
	}
			
	amev.notificationRichClosed=function(evt){
		try {
			if(evt.id!='')
			{
				if(!isDC){
					appMobiObj['notification']['deletePushNotifications'](evt.id);
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
					appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushUserFound, appMobiInst);
				}
			}else{
				if(!isDC){
					pushFriendUserId='';
					appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushUserNotFound, appMobiInst);
				}
			}
		} catch(e){}
	}
	
	amev.notificationPushSent=function(evt){
		try {
			if(evt.success)
			{
				if(!isDC){
					appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationSendSuccess, appMobiInst);
				}
			}else{
				if(!isDC){				
					appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationSendFail, appMobiInst);
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
				appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnRemoteSiteClosed, appMobiInst);
			}
		} catch(e){}
	};
	
	amev.onBack = function(event)
	{
		appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnBack, appMobiInst);
	};
		
	amev.audioStop=function(){	
		appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnAudioStop, appMobiInst);
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		appMobiRuntime = this.runtime;
		appMobiInst = this;
		isDC = this.runtime.isDirectCanvas;
		
		if (isDC){awex = AppMobi["webview"]["execute"]; }
		
		if (typeof window["AppMobi"] !== "undefined" && !isDC)
		{
			appMobiObj = window["AppMobi"];
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
		}
	};
	
	instanceProto.onLayoutChange = function ()
	{
	};
	
	window['dcNotificationEnabled']=function(){
		try{
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushEnabled, appMobiInst);
		}catch(e){}
	}
	
	
	window['dcNotificationReceived']=function(d){
		try {
			queue=JSON.parse(d);
			notificationPushQueue = queue;
			notificationPushQueueCount = notificationPushQueue.length;
			appMobiRuntime.trigger(window['cr']['plugins_'].appMobi.prototype.cnds.OnNotificationPushReceive, appMobiInst);
			
		} catch(e){console.log(e);}
	};

	window['dcNotificationRichClosed']=function(id){
		try{
			awex("appMobiObj['notification']['deletePushNotifications']('"+id+"');");
		}catch(e){}
	};
	
	window['dcNotificationPushUserFound']=function(id){
		try{
			pushFriendUserId=id;
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushUserFound, appMobiInst);
		}catch(e){}
	};
	
	window['dcNotificationPushUserNotFound']=function(){
		try{
			pushFriendUserId='';
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationPushUserNotFound, appMobiInst);

		}catch(e){}
	};
	
	window['dcNotificationPushSentSuccess']=function(){
		try{		
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationSendSuccess, appMobiInst);
		}catch(e){}
	};
	
	
	
	window['dcNotificationPushSentFail']=function(){
		try{		
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnNotificationSendFail, appMobiInst);
		}catch(e){}
	};
	
	window['dcGetRemoteData']=function(data){
		try{
			evtRemoteDataResponse=decodeURIComponent(data);
			appMobiRuntime.trigger(cr.plugins_.appMobi.prototype.cnds.OnRemoteData, appMobiInst); //appMobiInst
		}catch(e){}
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	/*********************************************************	
		DEVICE
	*********************************************************/	
	cnds.deviceHasCaching = function ()
	{
		if (!appMobiEnabled || isDC)
			return false;
		
		return appMobiObj['device']['hasCaching'];
	};
	
	cnds.deviceHasPush = function ()
	{
		if (!appMobiEnabled || isDC)
			return false;
			
		return appMobiObj['device']['hasPush'];
	};
	
	cnds.deviceHasStreaming = function ()
	{
		if (!appMobiEnabled || isDC)
			return false;
			
		return appMobiObj['device']['hasStreaming'];
	};
	
	cnds.deviceHasUpdates = function ()
	{
		if (!appMobiEnabled || isDC)
			return false;
			
		return appMobiObj['device']['hasUpdates'];
	};
	
	cnds.isInAppMobi = function ()
	{
		return appMobiEnabled || isDC;
	};
	
	var orients_array = [0, -90, 90, 180];
	
	cnds.compareOrientation = function (o)
	{
		if (!appMobiEnabled || isDC)
			return (o === 0);	// assume portrait when not in appMobi
			
		return orients_array[o] === parseInt(appMobiObj['device']['orientation']);
	};
	
	cnds.compareInitialOrientation = function (o)
	{
		if (!appMobiEnabled || isDC)
			return (o === 0);	// assume was in portrait when not in appMobi
			
		return orients_array[o] === parseInt(appMobiObj['device']['initialOrientation']);
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
				appMobiObj['device']['closeRemoteSite']();
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
				var parameters = new appMobiObj['Device']['RemoteDataParameters']();
				parameters.url = url;
				parameters.id = id;
				parameters.method = method;
				parameters.body = body;
				appMobiObj['device']['getRemoteDataExt'](parameters);
			} catch(e) {console.log('grd',e);}
		}
	}
	
	acts.deviceHideSplashScreen = function ()
	{
		try {
			if (isDC)
				awex("AppMobi['device']['hideSplashScreen']();");
			else
				appMobiObj['device']['hideSplashScreen']();
		} catch(e) {}
	};
	
	acts.deviceInstallUpdate = function ()
	{
		try {
			if (isDC)
				awex("AppMobi['device']['installUpdate']();");
			else
				appMobiObj['device']['installUpdate']();
		} catch(e) {}
	};
	
	acts.deviceLaunchExternal = function (url)
	{
		try {
			if (isDC)
				awex("AppMobi['device']['launchExternal']('" + url + "');");
			else
				appMobiObj['device']['launchExternal'](url);
		} catch(e) {}
	};
	
	acts.deviceMainViewExecute = function (cmd)
	{
		try {
			appMobiObj['device']['mainViewExecute'](cmd);
		} catch(e) {}
	};
	
	acts.deviceScanBarcode = function ()
	{
		if (isDC)
			return;
			
		try {
			evtBarCodeResponse=''; appMobiObj['device']['scanBarcode']();
		} catch(e) { console.log('Barcode Error',e);}
	};
	
	acts.deviceUpdateConnection = function ()
	{
		if (isDC)
			return;
		
		try {
			evtConnection=''; appMobiObj['device']['updateConnection']();
		} catch(e) {}
	};
	
	acts.deviceShowRemoteSite = function (url, w, h, px, py, lx, ly)
	{
		if (isDC)
			return;
			
		try {
			evtRemoteStatus='open'; appMobiObj['device']['showRemoteSiteExt'](url, px, py, lx, ly, w, h);
		} catch(e) {}
	};
	
	acts.deviceSetAutoRotate = function (allow)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['setAutoRotate'](" + (allow ? "true" : "false") + ");");
		else
			appMobiObj['device']['setAutoRotate'](allow !== 0);
	};
	
	acts.deviceSetRotateOrientation = function (orientation)
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['setRotateOrientation'](" + (orientation === 0 ? "'portrait'" : "'landscape'") + ");");
		else
			appMobiObj['device']['setRotateOrientation'](orientation === 0 ? "portrait" : "landscape");
	};
	
	/*********************************************************	
		ANALYTICS
	*********************************************************/		
	acts.analyticsLogEvent=function(event, qs){ 
		try{ 
			event="/application/" + event + ".event";
			
			if (isDC)
				awex("AppMobi['analytics']['logPageEvent']('" + event + "', '" + qs + "', 200, 'GET', 0, 'index.html');");
			else
				appMobiObj['analytics']['logPageEvent'](event, qs, 200, 'GET', 0, 'index.html'); 
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
				appMobiObj['notification']['addPushUser'](userId, password, email); 
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
				appMobiObj['notification']['alert'](message,title,buttontext); 
			}
		}catch(e){ console.log(e); }
	};	
	
	
	
	acts.notificationBeep=function(count){ 
		if(count.length==0){count=1;}
		if(count>1){count=1;}
		
		if (isDC){
			awex("AppMobi['notification']['beep']("+count+");");
		}else{
			appMobiObj['notification']['beep'](count); 
		}

	}
	acts.notificationVibrate=function(){ 
		if (isDC){
			awex("AppMobi['notification']['vibrate']();");
		}else{
			appMobiObj['notification']['vibrate'](); 
		}
	}
	
	acts.notificationDeleteUser=function(){ 
		if (isDC){
			awex("AppMobi['notification']['deletePushUser']();");
		}else{
			appMobiObj['notification']['deletePushUser'](); 
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
			var attributes = new appMobiObj['Notification']['PushUserAttributes']();
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
	
			appMobiObj['notification']['setPushUserAttributes'](attributes); 
		}
	}
	
	acts.notificationShowRich=function(i,removeMessage){ 
	
		if(typeof i === 'undefined' ){i=0;}
		if(typeof removeMessage === 'undefined' ){removeMessage='';}
		
		if (isDC){
			awex("AppMobi['notification']['showRichPushViewer']("+notificationPushQueue[i]+", 10, 10, 100, 100, 80, 80);");
		}else{
			appMobiObj['notification']['showRichPushViewer'](notificationPushQueue[i], 10, 10, 100, 100, 80, 80); 
		}
	}
	
	
	acts.notificationFindUser=function(email){ 
	
		if(typeof email === 'undefined' ){return false;}
		
		if (isDC){
			awex("AppMobi['notification']['findPushUser']('','"+email+"');");
		}else{
			appMobiObj['notification']['findPushUser']("",email); 
		}
	}
	
	
	acts.notificationSendPush=function(id, message, data){ 
	
		if(typeof id === 'undefined' ){return false;}
				
		if (isDC){
			awex("AppMobi['notification']['sendPushNotification']('"+id+"', '"+message+"', '"+data+"');");
		}else{
			appMobiObj['notification']['sendPushNotification'](id, message, data); 
		}
		
	}
	
	
	/*********************************************************	
		CACHE
	*********************************************************/
	acts.cacheAddToMediaCache=function(url)
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['addToMediaCache'](url); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheClearAllCookies=function()
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['clearAllCookies'](); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheClearMediaCache=function()
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['clearMediaCache'](); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheRemoveCookie=function(v)
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['removeCookie'](v); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheRemoveFromMediaCache=function(v)
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['removeFromMediaCache'](v); 
		}catch(e){ console.log(e); }
	}
	
	acts.cacheSetCookie=function(name, value, expires)
	{
		if (isDC)
			return;
			
		try{ 
			appMobiObj['cache']['setCookie'](name, value, expires); 
		}catch(e){ console.log(e); }
	}
	
	acts.AddVirtualPage = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
		
		if (isDC)
			awex("AppMobi['device']['addVirtualPage']();");
		else
			appMobiObj['device']['addVirtualPage']();
	};
	
	acts.RemoveVirtualPage = function ()
	{
		if (!appMobiEnabled && !isDC)
			return;
			
		if (isDC)
			awex("AppMobi['device']['removeVirtualPage']();");
		else
			appMobiObj['device']['removeVirtualPage']();
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
			appMobiObj['device']['sendSMS'](bodyText, toNumber);
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
				if(appMobiObj['device']['platform'].toLowerCase()=='ios'){ 
					appMobiObj['player']['loadSound']('./media/'+sndFile[0]+'.m4a', cnt);
				}else{ 
					appMobiObj['player']['loadSound']('./media/'+sndFile[0]+'.ogg', cnt);					
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
				if(appMobiObj['device']['platform'].toLowerCase()=='ios'){ 
					appMobiObj['player']['playSound']('./media/'+sndFile+'.m4a');
				}else{
					appMobiObj['player']['playSound']('./media/'+sndFile+'.ogg');
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
				if(appMobiObj['device']['platform'].toLowerCase()=='ios'){ 
					appMobiObj['player']['startAudio']('./media/'+sndFile+'.m4a',boolLoop);				
				}else{ 
					appMobiObj['player']['startAudio']('./media/'+sndFile+'.ogg',boolLoop);
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
			appMobiObj['player']['stopAudio']();
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
			appMobiObj['player']['toggleAudio']();
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
			appMobiObj['player']['unloadAllSounds']();
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
			if(appMobiObj['device']['platform'].toLowerCase()=='ios'){ 
				appMobiObj['player']['unloadSound']('./media/'+sndFile+'.m4a');
			}else{ 
				appMobiObj['player']['unloadSound']('./media/'+sndFile+'.ogg');
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
	exps.AppMobiVersion = function(ret){ try{ret.set_string(appMobiObj['device']['appmobiversion']);}catch(e){ret.set_string('');}	}
	exps.DeviceConnection = function(ret){ try{ret.set_string(appMobiObj['device']['connection']);}catch(e){ret.set_string('');}	}
	exps.InitialOrientation = function(ret){ try{ret.set_int(parseInt(appMobiObj['device']['initialOrientation']));}catch(e){ret.set_int(0);}	}
	exps.DeviceLastStation = function(ret){ try{ret.set_string(appMobiObj['device']['lastStation']);}catch(e){ret.set_string('');}	}
	exps.DeviceModel = function(ret){ try{ret.set_string(appMobiObj['device']['model']);}catch(e){ret.set_string('');}	}
	exps.Orientation = function(ret){ try{ret.set_int(parseInt(appMobiObj['device']['orientation']));}catch(e){ret.set_int(0);}	}
	exps.DeviceOSVersion = function(ret){ try{ret.set_string(appMobiObj['device']['osversion']);}catch(e){ret.set_string('');}	}
	exps.DevicePhonegapVersion = function(ret){ try{ret.set_string(appMobiObj['device']['phonegapversion']);}catch(e){ret.set_string('');}	}
	exps.DevicePlatform = function(ret){ try{ret.set_string(appMobiObj['device']['platform']);}catch(e){ret.set_string('');}	}
	exps.DeviceQueryString = function(ret){ try{ret.set_string(appMobiObj['device']['queryString']);}catch(e){ret.set_string('');}	}
	exps.DeviceUUID = function(ret){ try{ret.set_string(appMobiObj['device']['uuid']);}catch(e){ret.set_string('');}	}
	exps.DeviceRemoteData = function(ret){ try{ret.set_string(evtRemoteDataResponse);}catch(e){ret.set_string('');}	}
	exps.DeviceBarcodeData = function(ret){ try{ ret.set_string(evtBarCodeResponse);}catch(e){ret.set_string('');} }
	exps.DeviceRemoteStatus = function(ret){ try{ret.set_string(evtRemoteStatus);}catch(e){ret.set_string('');} }
	
	
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
			msgObj = appMobiObj['notification']['getNotificationData'](notificationPushQueue[i]); 
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
			var msgObj = appMobiObj['notification']['getNotificationData'](notificationPushQueue[i]); 

			if (msgObj['isRich']==false) {
				ret.set_string(unescape(msgObj['msg']));	
				if(removeMessage=='remove'){
					appMobiObj['notification']['deletePushNotifications'](msgObj['id']);
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
			
			msgObj = appMobiObj['notification']['getNotificationData'](notificationPushQueue[i]); 
			if(msgObj['data']!='null'){
				ret.set_string(msgObj['data']);
				if(removeMessage=='remove'){
					appMobiObj['notification']['deletePushNotifications'](msgObj['id']);
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
			ret.set_string(appMobiObj['cache']['getCookie'](p)); 
		}catch(e){ ret.set_string(''); }
	}
	
	exps.LocalMediaCacheURL = function(ret, p){ 
		try{
			ret.set_string(appMobiObj['cache']['getMediaCacheLocalURL'](p)); 
		}catch(e){ ret.set_string(''); }
	}	

}());
