/**
 * Created by wzy on 2017/6/3.
 */
/*点击登录*/
var userNow,pwdNow;
var userCookie = parseInt(Cookie.getCookie("user"));
var pwdCookie = parseInt(Cookie.getCookie("pwd"));
if(userCookie&&pwdCookie){
    $(".user-text").val(Cookie.getCookie("user"));
    $(".pwd-text").val(Cookie.getCookie("pwd"));
    $(".prompt").text("");
}
$(".btn").on("click",function(){
   userNow = $(".user-text").val().trim();
   pwdNow = $(".pwd-text").val().trim();
   var reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/g;
   if(!userNow){
       $(".prompt").text("请填写身份证号！");
       return;
   }else if(!pwdNow){
       $(".prompt").text("请填写密码！");
       return;
   }
   if(reg.test(userNow)){
       $.ajax({
           url:"php/login.php",
           type:"POST",
           data:{
               loginuser:userNow,
               loginpwd:pwdNow
           },
           success:function(res){
               if(res == "success"){
                   if($("#checkbox-remember").prop("checked")){
                       setCookie();
                   }
                   window.sessionStorage.setItem("user",userNow);
                   window.location.href = "learn.html";
               }else{
                   $(".prompt").text("账号或密码错误!");
                   return;
               }
           },
           error:function(err){
               alert(err);
           }
       });
   }else{
       $(".prompt").text("身份证格式不正确！");
       return;
   }
});
$(document).on("keydown",function(event){
    if(event.keyCode == 13){
        $(".btn").trigger("click");
    }
});
function setCookie(){
    Cookie.setCookie("user",userNow,"d10");
    Cookie.setCookie("pwd",pwdNow,"d10");
}