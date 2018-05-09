/**
 * Created by wzy on 2017/6/6.
 */
var userNow,pwdNow;
$(".btn").on("click",function(){
    userNow = $(".user-text").val().trim();
    pwdNow = $(".pwd-text").val().trim();
    if(!userNow){
        $(".prompt").text("请填写账号！");
        return;
    }else if(!pwdNow){
        $(".prompt").text("请填写密码！");
        return;
    }
    $.ajax({
        url:"php/admin.php",
        type:"POST",
        data:{
            loginuser:userNow,
            loginpwd:pwdNow
        },
        success:function(res){
            if(res == "success"){
                window.sessionStorage.setItem("admin",userNow);
                window.location.href = "manage.html";
            }else{
                $(".prompt").text("账号或密码错误!");
                return;
            }
        },
        error:function(err){
            alert(err);
        }
    });
});
$(document).on("keydown",function(event){
    if(event.keyCode == 13){
        $(".btn").trigger("click");
    }
});
