// Copyright 2012 appMobi -- All rights reserved
(function(){
    var _jsonPID=0;
    var googleIncluded=false;
    var jsonPRetries={};
    var jsonP = function(url,cb,error) {
            if(!jsonPRetries[url])
                jsonPRetries[url]=0;
            var callbackName = 'chrome_cb_' + (++_jsonPID);
            var abortTimeout = "";
            var script = document.createElement("script");
            var abort = function() {
                script.parentNode.removeChild(script);
                if (window[callbackName])
                    window[callbackName] = null;
                jsonPRetries[url]++;
                if(error&&jsonPRetries[url]<3)
                    error();
            };
            
            window[callbackName] = function(data) {
                
                clearTimeout(abortTimeout);
                script.parentNode.removeChild(script);
                delete window[callbackName];
                delete jsonPRetries[url];
                cb.call(null, data);
            };
            script.src =url+"&callback="+callbackName;
            script.onerror=function(){
                clearTimeout(abortTimeout);
                jsonPRetries[url]++;
                if(error&&jsonPRetries[url]<3)
                    error();
            };
            document.getElementsByTagName("head")[0].appendChild(script);
                abortTimeout = setTimeout(function() {
                    abort();
             }, 60000);
            return {};
    };

    document.addEventListener("appMobi.device.ready",function(){
        if(AppMobi.isnative||AppMobi.isxdk)
            return;
        if(AppMobi.isfacebook){
            AppMobi.purchasing={
                fbListenerCreated: false,
                receiveFbMessage: function(e) {  
                     if (event.origin !== location.protocol+"//fb.appmobi.com")    
                        return;  
                            
                    var evt = document.createEvent("Event");
                    evt.initEvent("appMobi.purchasing.complete",true,true);
                    if(e.data['order_id']){
                        evt.success=true;
                        for(var j in e.data){
                            evt[j]=e.data[j];
                        }
                    }
                    else{
                        evt.success="false";
                        evt.message=data['error_message'];
                    }
                    document.dispatchEvent(evt);
                },

                purchaseProduct:function(product_id,quantity,user_id){
                    var data="product_id:"+product_id+",quantity:"+quantity+",user_id:"+user_id+",app:"+AppMobi.app+",device:"+AppMobi.device.uuid;
                    if (!this.fbListenerCreated)
                        window.addEventListener("message", AppMobi.purchasing.receiveFbMessage, false);

                    this.fbListenerCreated = true;
                    parent.postMessage(data,location.protocol+'//fb.appmobi.com');
                }
            }
        }
        else if(AppMobi.ischrome){    
            AppMobi.purchasing={
                purchaseProduct:function(product_id,quantity,user_id){
                    jsonP("https://services.appmobi.com/1touch/OneTouchServices.aspx?cmd=GetGoogleJWT&product_id="+encodeURIComponent(product_id)+"&quantity="+encodeURIComponent(quantity)+"&user_id="+encodeURIComponent(user_id)+"&app="+encodeURIComponent(AppMobi.app)+"&device="+encodeURIComponent(AppMobi.device.uuid),
                        function(obj){
                            var data="product_id:"+product_id+",quantity:"+quantity+",user_id:"+user_id+",app:"+AppMobi.app+",device:"+AppMobi.device.uuid;
                            goog.payments.inapp.buy({
                                seller_data:data,
                                jwt:""+obj.Thing,
                                success: function() {googCBHandler(true)},
                                failure: function(msg) {googCBHandler(false,"There was an error completing your Google In-App payments");}
                            });
                        },
                        function(msg){
                            AppMobi.notification.alert("There was an error completing your Google In-App payments");
                        }
                    );
                }
            };
          
            var googCBHandler=function(success,msg){
                var evt = document.createEvent("Event");
                evt.initEvent("appMobi.purchasing.complete",true,true);
                evt.success=success;
                evt.message=msg;
                document.dispatchEvent(evt);
            };
        }
    });
})();
    

var OneTouch = (function () {
    var OneTouchCloseEvt;
    var product_id = "";
    var quantitiy = "";
    var user = "";
    var callback = "";
    var userID = "";
    var available = false;
    var OneTouchPaymentEvt;
    var failCallback="";
    var OneTouch = {
        buy: function (prod_id, quant, cb,failcb,use1Touch) {
            if (!available) return AppMobi.notification.alert("1Touch is not available");
			if (!this.appName) return AppMobi.notification.alert("App name is not configured");

            product_id = prod_id;
            quantitiy = quant;
            callback = cb;
            if(failcb)
                failCallback=failcb;
            if(use1Touch===undefined)
                use1Touch="";
            if (prod_id.length == 0) return AppMobi.notification.alert("Please enter a product id");
            if (quant.length == 0) return AppMobi.notification.alert("Please enter a quantify");
            if (cb.toString().length == 0 || typeof (cb) != "function") return AppMobi.notification.alert("Please enter a callback for this purchase");
            if (!userID || userID == ""||(use1Touch&&AppMobi.cache.getCookie("OneTouch_TempID")=="true")) {
                if(use1Touch){
                    AppMobi.device.showRemoteSite(AppMobi.webRoot + "1touch/1touch.html?merge="+encodeURIComponent(AppMobi.cache.getCookie("OneTouch_UserID")), window.innerWidth-91,0,91,72);
                    var that = this;
                    document.addEventListener("appMobi.device.remote.close", OneTouchCloseEvt = function () {
                    }, false);
                }
                else {
                    var tmpID = AppMobi.app + AppMobi.device.uuid+"@appmobi.com";
                    tmpID = tmpID.replace(" ", "_");
                    var pw=AppMobi.device.uuid.substring(0,30);
                    
                    ota.register(tmpID,pw,function(data){
                        if(data['success'])
                        {
                            OneTouchWorker.setUserKey(data['userkey']);
                            AppMobi.cache.setCookie("OneTouch_TempID", true, -1);
                            OneTouchWorker.initPurchase();
                            
                        }
                        else {
                            return AppMobi.notification.alert("Error registering account "+data.error);
                        }
                    });
                }
            } else {
                OneTouchWorker.initPurchase();
            }
        },
        login: function () {
            if (!available) return AppMobi.notification.alert("1Touch is not available");
			if (!this.appName) return AppMobi.notification.alert("App name is not configured");

            if (!userID || userID == "") {
                AppMobi.device.showRemoteSite(AppMobi.webRoot + "1touch/1touch.html", window.innerWidth-91,0,91,72);
                var that = this;
                document.addEventListener("appMobi.device.remote.close", OneTouchCloseEvt = function () {
                    that.paymentClose()
                }, false);
            } else {
                AppMobi.notification.alert("Already logged into 1Touch");
            }
        },
		paymentClose:function(){
		   OneTouchWorker.paymentClose();
		},
		setUserKey:function(val){
            OneTouchWorker.setUserKey(val);
		},
		initPurchase:function(){
		   OneTouchWorker.initPurchase();
		}

    }
    var OneTouchWorker = {
        paymentClose: function () {
            document.removeEventListener("appMobi.device.remote.close", OneTouchCloseEvt, true);
        },
        setUserKey: function (key) {
        	userID = key;
            AppMobi.cache.setCookie("OneTouch_UserID", key, -1);
            AppMobi.cache.removeCookie("OneTouch_TempID");
        },
        initPurchase: function () {
            AppMobi.purchasing.purchaseProduct(product_id, quantitiy, userID)
        },
        finishPurchase: function (evt) {
		    //Now we need to get the new inventory for that object?
            if (evt.success) {
                if(typeof(callback)=="function")
                    callback(evt.product);
            } else {
                if(typeof(failCallback)=="function")
                    failCallback(evt);
                else
                    AppMobi.notification.alert(evt.message);
            }
            return;
        }
    };
    document.addEventListener("appMobi.purchasing.busy", function () {
        AppMobi.notification.alert("1Touch is currently busy");
    }, false);
    document.addEventListener("appMobi.purchasing.complete", OneTouchWorker.finishPurchase, false);
    document.addEventListener("appMobi.device.ready", function () {
        
        
        OneTouch.appName = AppMobi.app;
        userID = AppMobi.cache.getCookie("OneTouch_UserID");
        
        var script=document.createElement("script");
        script.src="https://services.appmobi.com/1touch/OneTouchAuth.js";
        //script.src="http://localhost/1touch/OneTouchAuth.js";
		script.type="text/javascript";
		script.onload=function(){
			ota = new OneTouchAuth(AppMobi.app);
            available = true;
		}
		document.getElementsByTagName("head")[0].appendChild(script);
    }, false);
    return OneTouch;
})();