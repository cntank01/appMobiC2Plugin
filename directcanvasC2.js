
/****************************************************************
	GRAB SOME VARIABLES ON STARTUP
****************************************************************/
 window['dcGetDeviceInfo']=function(){
	hasCaching=AppMobi['device']['hasCaching'];
	AppMobi.canvas.execute("window['dcDeviceHasCaching']('"+hasCaching+"');");	
	
	hasPush=AppMobi['device']['hasPush'];
	AppMobi.canvas.execute("window['dcDeviceHasPush']('"+hasPush+"');");	
	
	hasStreaming=AppMobi['device']['hasStreaming'];
	AppMobi.canvas.execute("window['dcDeviceHasStreaming']('"+hasStreaming+"');");	
	
	hasUpdates=AppMobi['device']['hasUpdates'];
	AppMobi.canvas.execute("window['dcDeviceHasUpdates']('"+hasUpdates+"');");	
	
	orientation=AppMobi['device']['orientation'];
	AppMobi.canvas.execute("window['dcDeviceOrientation']('"+orientation+"');");	
	
	initialOrientation=AppMobi['device']['initialOrientation'];
	AppMobi.canvas.execute("window['dcDeviceInitialOrientation']('"+initialOrientation+"');");	

}

/****************************************************************
	EVENTS
****************************************************************/
document.addEventListener("appMobi.notification.push.enable", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['dcNotificationEnabled']();");				
	}
}, false);

document.addEventListener("appMobi.device.barcode.scan", function(evt){
	if(evt.success){			
		var str=evt.codedata;
		str.replace("'","\'");
		AppMobi.canvas.execute("window['dcBarcodeScanned']('"+str+"');");				
	}
}, false);

document.addEventListener("appMobi.notification.push.receive", function(evt){			
		
	try {
		if(evt.success)
		{
			notificationPushQueue = AppMobi['notification']['getNotificationList'](); 
			AppMobi.canvas.execute("window['dcNotificationReceived']('"+JSON.stringify(notificationPushQueue)+"');");				
		}
	} catch(e){}
		
}, false);

document.addEventListener("appMobi.notification.push.rich.close", function(evt){
	if(evt.id!=''){			
		AppMobi.canvas.execute("window['dcNotificationRichClosed']('"+evt.id+"');");				
	}
}, false);

document.addEventListener("appMobi.notification.push.user.find", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['dcNotificationPushUserFound']('"+evt.userid+"');");				
	}else{
		AppMobi.canvas.execute("window['dcNotificationPushUserNotFound']('"+evt.userid+"');");				
	}
}, false);

document.addEventListener("appMobi.notification.push.send", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['dcNotificationPushSentSuccess']();");				
	}else{
		AppMobi.canvas.execute("window['dcNotificationPushSentFail']();");				
	}
}, false);


document.addEventListener("appMobi.device.remote.data", function(evt){
	try {
		if(evt.success){
			AppMobi.canvas.execute("window['dcGetRemoteData']('"+encodeURIComponent(evt.response)+"');");
		}
	} catch(e){}
},false);

document.addEventListener("appMobi.camera.picture.add",function(evt){
	try{
		if (evt.success == true){ 
			AppMobi.canvas.execute("window['amevPictureSuccess']();");
			if(window['appMobiFileUploadURL'].length>0){
				pictureURL=AppMobi['camera']['getPictureURL'](evt.filename);
				AppMobi['file']['uploadToServer'](pictureURL,window['appMobiFileUploadURL'], "", "image/jpeg", "");
			}
		}
	}catch(e){}

},false); 

document.addEventListener("appMobi.file.upload",function(evt){ 
	try{
		if(evt.success){
			AppMobi.canvas.execute("window['amevFileUploaded']()"); 
		}
	}catch(e){}
},false);


/****************************************************************
	ACTIONS
****************************************************************/
function dcNotificationSetUserAttributes(s){
	try{
		d=JSON.parse(s);
		attributes = new AppMobi['Notification']['PushUserAttributes']();
		if(d.s1.length>0){
			if(d.s1=='*'){ d.s1=''; }
			attributes.s1 = d.s1;
		}
		if(d.s2.length>0){
			if(d.s2=='*'){ d.s2=''; }
			attributes.s2 = d.s2;
		}
		if(d.s3.length>0){
			if(d.s3=='*'){ d.s3=''; }
			attributes.s3 = d.s3;
		}
		if(d.s4.length>0){
			if(d.s4=='*'){ d.s4=''; }
			attributes.s4 = d.s4;
		}
		if(d.s5.length>0){
			if(d.s5=='*'){ d.s5=''; }
			attributes.s5 = d.s5;
		}
		if(d.s6.length>0){
			if(d.s6=='*'){ d.s6=''; }
			attributes.s6 = d.s6;
		}
		if(d.n1.length>0){
			if(d.n1=='*'){ d.n1=''; }
			attributes.n1 = d.n1;
		}
		if(d.n2.length>0){
			if(d.n2=='*'){ d.n2=''; }
			attributes.n2 = d.n2;
		}
		if(d.n3.length>0){
			if(d.n3=='*'){ d.n3=''; }
			attributes.n3 = d.n3;
		}
		if(d.n4.length>0){
			if(d.n4=='*'){ d.n4=''; }
			attributes.n4 = d.n4;
		}
	
		AppMobi['notification']['setPushUserAttributes'](attributes);
	
	}catch(e){console.log(e);}
}

function GetRemoteData(method,url,body,id){
	AppMobi.device.getRemoteData(url, method, body, 'processRemoteData', 'processRemoteData');
}

function processRemoteData(data){
	d=data.replace("'", "&#39;");
	AppMobi.canvas.execute("window['dcGetRemoteData']('"+d+"');");
}
function wvGeoProcessLocation(p){
	AppMobi.canvas.execute("window['amevGeoProcessLocation']('"+p.coords.latitude+"','"+p.coords.longitude+"');");
}
function wvGeoProcessLocationFail(p){}

function wvAccelSuccess(p){
	AppMobi.canvas.execute("window['amevAccelProcess']('"+p.x+"','"+p.y+"','"+p.z+"');");
}

function wvAccelFail(p){}