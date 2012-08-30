/****************************************************************
	EVENTS
****************************************************************/
document.addEventListener("appMobi.notification.push.enable", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationEnabled();");				
	}
}, false);

document.addEventListener("appMobi.notification.push.receive", function(evt){			
		
	try {
		if(evt.success)
		{
			notificationPushQueue = AppMobi['notification']['getNotificationList'](); 
			AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationReceived('"+JSON.stringify(notificationPushQueue)+"');");				
		}
	} catch(e){}
		
}, false);

document.addEventListener("appMobi.notification.push.rich.close", function(evt){
	if(evt.id!=''){			
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationRichClosed('"+evt.id+"');");				
	}
}, false);

document.addEventListener("appMobi.notification.push.user.find", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationPushUserFound('"+evt.userid+"');");				
	}else{
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationPushUserNotFound('"+evt.userid+"');");				
	}
}, false);

document.addEventListener("appMobi.notification.push.send", function(evt){
	if(evt.success){			
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationPushSentSuccess();");				
	}else{
		AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcNotificationPushSentFail();");				
	}
}, false);


document.addEventListener("appMobi.device.remote.data", function(evt){
	try {
		if(evt.success){
			AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcGetRemoteData('"+encodeURIComponent(evt.response)+"');");
		}
	} catch(e){}
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

function dcGetRemoteData(method,url,body,id){
	AppMobi.device.getRemoteData(url, method, body, 'processRemoteData', 'processRemoteData');
}

function processRemoteData(data){
	d=data.replace("'", "&#39;");
	AppMobi.canvas.execute("window['cr']['plugins_'].appMobi.prototype.Instance.prototype.dcGetRemoteData('"+d+"');");
}