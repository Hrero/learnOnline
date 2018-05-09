/**
 * Created by wzy on 2017/6/4.
 */
(function(){
    window.Cookie = {
        setCookie:function(name,val,expires){
            if(!name || !val || name.trim().length==0 || val.trim().length ==0){
                return;
            }
            if(expires){
                var timer = this._getTime(expires);
                document.cookie = name + "=" + val + ";expires=" + timer;
                return;
            }
            document.cookie = name + "=" + val;
        },
        removeCookie:function(name){
            var cookies = document.cookie;
            var array = null;
            if(cookies.indexOf(";") != -1){
                array = cookies.split(";");
            }else{
                array = [cookies];
            }
            for(var i=0;i<array.length;i++){
                var str = array[i];
                str = str.split("=");
                if(str[0]==name){
                    this.setCookie(name,".","s-1");
                }
            }
        },
        _getTime:function(expires){
            var first = expires.substring(0,1).toLowerCase();
            var second = expires.split(first)[1];
            var time = new Date().getTime();
            if(first == "s"){
                time += second*1000;
            }else if(first == "m"){
                time += second*1000*60;
            }else if(first == "h"){
                time += second*1000*60*60;
            }else if(first == "d"){
                time += second*1000*60*60*24;
            }
            return new Date(time).toUTCString();
        },
        getCookie:function(name){
            var cookies = document.cookie;
            var array = null;
            var cobj = {};
            if(cookies.length>0){
                // console.log(cookies);
                if(cookies.indexOf(";") != -1){
                    array = cookies.split(";");
                }else{
                    array = [cookies];
                }
                for(var i=0;i<array.length;i++){
                    var str = array[i];
                    str = str.split("=");
                    cobj[str[0].trim()] = str[1];
                }
                if(cobj[name]){
                    return cobj[name];
                }else{
                    return cobj;
                }
            }
        }
    };
})();