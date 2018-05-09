/**
 * Created by wzy on 2017/6/4.
 */
var initArr = [[],[],[]];
var finishArr = [[[],[]],[[],[],[]]];
var errorArr = [];
var remember1 = [],remember2 = [],remember3 = [];
var errorRemIndex;
var userName = window.sessionStorage.getItem("user");
/*------------------------------- init ------------------------------------------*/
if(!userName){
    window.location.href = "login.html";
}
$(".user-name-text").text("当前用户："+userName);
$.ajax({

    // url:"./php/learn.json",
    // type:"POST",
    // data:{
    //     userName:userName,
    // },
    //success:function(res){
        //可以注释的
        // console.log(res)
        // var userInfo = res;
        // console.log(userInfo.one[0].type)
        // if(userInfo.one[0].type.length>0){
        //     var userType = userInfo.one[0].type.split(",");
    url:"php/select-user.php",
    type:"POST",
    data:{
        userName:userName,
    },
    success:function(res){
        var userInfo = JSON.parse(res);
        if(userInfo[0].type.length>0){
           var userType = userInfo[0].type.split(",");

            for(var i=0;i<userType.length;i++){
                var tr = $("<tr></tr>");
                var td = $("<td>"+(i+1)+"</td><td>"+userType[i]+"</td><td><span class='userTime'>59时55分</span></td>");
                var button = $("<td><button type='button' class='btn btn-primary btn-sm go-practice'>练习模式</button><button type='button' class='btn btn-success btn-sm' data-num='"+i+"'>考试模式</button><button type='button' class='btn btn-danger btn-sm go-error' data-num='"+i+"'>考试错题</button></td>");
                tr.append(td).append(button);
                $("tbody").append(tr);
                errorArr[i] = [[],[],[]];
            }
            userTime(userInfo[0].createtime);
        }
    }
});

/*用户时长*/
function userTime(timeStr){
    var userStartTime = timeStr;
    var timeLong = Date.parse(new Date(userStartTime))+316800000;
    var nowTime = new Date().getTime();
    var endTime = timeLong - nowTime;
    endTime = endTime / 1000;
    var userHours = Math.floor(endTime / 3600);
    var userMin = Math.floor(endTime % 3600 / 60);
    $(".userTime").text(userHours+"时"+userMin+"分");
    if(userHours<=0&&userMin<=0){
        $(".btn-sm").attr("disabled", true);
        $(".userTime").text("账号已过期");
    }
}
$(".pwdBtn").on("click",function(){
    var pwdOld = $(".pwdOld").val().trim();
    var pwdNew = $(".pwdNew").val().trim();
    var pwdNewAgain = $(".pwdNewAgain").val().trim();
    if(pwdNew.length < 6){
        $(".redText").text("新密码长度不够！");
        return;
    }else if(pwdNew != pwdNewAgain){
        $(".redText").text("两次密码设置不一样！");
        return;
    }else if(pwdNew == pwdOld){
        $(".redText").text("新密码和旧密码不能相同!");
        return;
    }
    $.ajax({
        url:"php/pwd-change.php",
        type:"POST",
        data:{
            user:user,
            oldPwd:pwdOld,
            newPwd:pwdNew
        },
        success:function(res){
            console.log(res)
            if(res == "success"){
                $(".redText").text("设置成功！");
                $(".changePwd input").val("");
                window.location.href = "login.html";
            }else if(res == "errorOld"){
                $(".redText").text("旧密码不对！");
            }else{
                $(".redText").text("设置失败！");
            }
        },
        error:function(err){
            alert(err);
        }
    });
});
$(document).on("keydown",function(event){
    if(event.keyCode == 123){
        return false;
    }
});
/*------------------------------- 考试部分 ------------------------------------------*/
/*随机数*/
function randomNum(min,max){
    return Math.round(Math.random()*(max-min) + min);
}
/*生成题库*/
function init(topicArr){
    for(var i=0;i<103;i++){
        var num = randomNum(0,topicArr[0].length-1);
        if(remember1.indexOf(num) == -1){
            remember1.push(num);
            finishArr[0][0].push(topicArr[0][num]);
        }else{
            i--;
        }
    }
    for(var i=0;i<23;i++){
        var num = randomNum(0,topicArr[1].length-1);
        if(remember2.indexOf(num) == -1){
            remember2.push(num);
            finishArr[0][1].push(topicArr[1][num]);
        }else{
            i--;
        }
    }
    for(var i=0;i<60;i++){
        var num = randomNum(0,topicArr[0].length-1);
        if(remember1.indexOf(num) == -1){
            remember1.push(num);
            finishArr[1][0].push(topicArr[0][num]);
        }else{
            i--;
        }
    }
    for(var i=0;i<12;i++){
        var num = randomNum(0,topicArr[1].length-1);
        if(remember2.indexOf(num) == -1){
            remember2.push(num);
            finishArr[1][1].push(topicArr[1][num]);
        }else{
            i--;
        }
    }
    if(topicArr[2]&&topicArr[2].length>0){
        for(var i=0;i<4;i++){
            var num = randomNum(0,topicArr[2].length-1);
            if(remember3.indexOf(num) == -1){
                remember3.push(num);
                finishArr[1][2].push(topicArr[2][num]);
            }else{
                i--;
            }
        }
    }
}
var point = 0,timer,module1,module2,ksName;
/*进入考试*/
function module(moduleIndex,min){
    $(".num-wapper,.prev,.next,.choose-wapper input[type=radio],.case-wapper input[type=radio]").off("click");
    $(".choose-wapper-more input[type=checkbox],.case-wapper input[type=checkbox]").off("change");
    var onecLength = finishArr[moduleIndex][0].length;
    var moreLength = finishArr[moduleIndex][1].length;
    var indexBtn = 1,minute = min,second = 59;
    var arr = [],arrAnswer = [],errorNum = [],errorCase = [];
    $(".text-wapper,.onlyOne,.moreChooose").html("");
    if($(".caseBtnBox")){
        $(".caseBtnBox").prev().remove();
        $(".caseBtnBox").remove();
    }
    $(".settimer p").text("本模块还剩："+(min+1)+"分").removeClass("red");
    var h4 = $("<h4 class='explain'>(一)、单项选择题(1分一小题)</h4>");
    $(".text-wapper").append(h4)
    /*生成右侧按钮和题*/
    for(var i=0;i<onecLength;i++){
        var button = $("<button>"+(i+1)+"</button>");
        $(".onlyOne").append(button);
        var chooseWapper = $("<div class='choose-wapper hide choose-box'></div>");
        var subject = $("<p class='subject'>"+(i+1)+"、"+finishArr[moduleIndex][0][i].subject+"</p>");
        var a = $("<div><input type='radio' name='onec"+i+"' id='a"+i+"'><label for='a"+i+"'>"+finishArr[moduleIndex][0][i].a+"</label></div>");
        var b = $("<div><input type='radio' name='onec"+i+"' id='b"+i+"'><label for='b"+i+"'>"+finishArr[moduleIndex][0][i].b+"</label></div>");
        var c = $("<div><input type='radio' name='onec"+i+"' id='c"+i+"'><label for='c"+i+"'>"+finishArr[moduleIndex][0][i].c+"</label></div>");
        var d = $("<div><input type='radio' name='onec"+i+"' id='d"+i+"'><label for='d"+i+"'>"+finishArr[moduleIndex][0][i].d+"</label></div>");
        chooseWapper.append(subject).append(a).append(b).append(c).append(d);
        $(".text-wapper").append(chooseWapper);
        $(".text-wapper .choose-wapper").eq(0).removeClass("hide");
    }
    for(var i=0;i<moreLength;i++){
        var button = $("<button>"+(onecLength+i+1)+"</button>");
        $(".moreChooose").append(button);
        var chooseWapperMore = $("<div class='choose-wapper-more hide choose-box'></div>");
        var subjectMore = $("<p class='subject'>"+(i+1+onecLength)+"、"+finishArr[moduleIndex][1][i].subject+"</p>");
        var aa = $("<div><input type='checkbox' id='aa"+i+"'><label for='aa"+i+"'>"+finishArr[moduleIndex][1][i].a+"</label></div>");
        var bb = $("<div><input type='checkbox' id='bb"+i+"'><label for='bb"+i+"'>"+finishArr[moduleIndex][1][i].b+"</label></div>");
        var cc = $("<div><input type='checkbox' id='cc"+i+"'><label for='cc"+i+"'>"+finishArr[moduleIndex][1][i].c+"</label></div>");
        var dd = $("<div><input type='checkbox' id='dd"+i+"'><label for='dd"+i+"'>"+finishArr[moduleIndex][1][i].d+"</label></div>");
        chooseWapperMore.append(subjectMore).append(aa).append(bb).append(cc).append(dd);
        if(finishArr[moduleIndex][1][i].e){
            var ee = $("<div><input type='checkbox' id='ee"+i+"'><label for='ee"+i+"'>"+finishArr[moduleIndex][1][i].e+"</label></div>");
            chooseWapperMore.append(ee);
        }
        $(".text-wapper").append(chooseWapperMore);
    }
    if(moduleIndex == 1&&finishArr[moduleIndex][2].length>0){
        var ceseBtnBox = $("<p>(三)、案例题</p><div class='clearfix caseBtnBox'></div>");
        $(".num-wapper").append(ceseBtnBox);
        var caseBtnNum = 0;
        for(var i=0;i<finishArr[1][2].length;i++){
            var caseWappper = $("<div class='case-wapper hide choose-box'></div>");
            var caseTitle = $("<div class='case-title'>"+(i+1)+"、"+finishArr[1][2][i].title+"</div>");
            caseWappper.append(caseTitle);
            for(var j=0;j<finishArr[1][2][i].content.length;j++){
                if(finishArr[1][2][i].content[j].yes.length==1){
                    var subject = $("<p class='subject'>"+(j+1+onecLength+moreLength+caseBtnNum)+"、"+finishArr[1][2][i].content[j].subject+"</p>");
                    var cAa = $("<div><input type='radio' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' name='cAonec"+j+i+"' id='cAa"+j+i+"'><label for='cAa"+j+i+"'>"+finishArr[1][2][i].content[j].a+"</label></div>");
                    var cAb = $("<div><input type='radio' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' name='cAonec"+j+i+"' id='cAb"+j+i+"'><label for='cAb"+j+i+"'>"+finishArr[1][2][i].content[j].b+"</label></div>");
                    if(finishArr[1][2][i].content[j].c){
                        var cAc = $("<div><input type='radio' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' name='cAonec"+j+i+"' id='cAc"+j+i+"'><label for='cAc"+j+i+"'>"+finishArr[1][2][i].content[j].c+"</label></div>");
                        var cAd = $("<div><input type='radio' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' name='cAonec"+j+i+"' id='cAd"+j+i+"'><label for='cAd"+j+i+"'>"+finishArr[1][2][i].content[j].d+"</label></div>");
                        caseWappper.append(subject).append(cAa).append(cAb).append(cAc).append(cAd);
                    }else{
                        caseWappper.append(subject).append(cAa).append(cAb);
                    }
                }else{
                    var subjectMore = $("<p class='subject'>"+(j+1+onecLength+moreLength+caseBtnNum)+"、"+finishArr[1][2][i].content[j].subject+"</p>");
                    var cAaa = $("<div><input type='checkbox' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' id='cAaa"+j+i+"'><label for='cAaa"+j+i+"'>"+finishArr[1][2][i].content[j].a+"</label></div>");
                    var cAbb = $("<div><input type='checkbox' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' id='cAbb"+j+i+"'><label for='cAbb"+j+i+"'>"+finishArr[1][2][i].content[j].b+"</label></div>");
                    var cAcc = $("<div><input type='checkbox' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' id='cAcc"+j+i+"'><label for='cAcc"+j+i+"'>"+finishArr[1][2][i].content[j].c+"</label></div>");
                    var cAdd = $("<div><input type='checkbox' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' id='cAdd"+j+i+"'><label for='cAdd"+j+i+"'>"+finishArr[1][2][i].content[j].d+"</label></div>");
                    caseWappper.append(subjectMore).append(cAaa).append(cAbb).append(cAcc).append(cAdd);
                    if(finishArr[1][2][i].content[j].e){
                        var cAee = $("<div><input type='checkbox' data-answer='"+finishArr[1][2][i].content[j].yes+"' data-num='"+(j+1+onecLength+moreLength+caseBtnNum)+"' id='cAee"+j+i+"'><label for='cAee"+j+i+"'>"+finishArr[1][2][i].content[j].e+"</label></div>");
                        caseWappper.append(cAee)
                    }
                }
            }
            $(".text-wapper").append(caseWappper);
            var len = finishArr[1][2][i].content.length;
            caseBtnNum += len;
        }
        for(var i = 0;i<caseBtnNum;i++){
            var button = $("<button>"+(i+1+onecLength+moreLength)+"</button>");
            $(".caseBtnBox").append(button);
        }
    }
    /*案例题单选*/
    $(".case-wapper input[type=radio]").on("click",function(){
        var sure = $(this).next().text().charAt(0);
        var answer = $(this).data("answer");
        var answerNum = $(this).data("num");
        if(sure == answer){
            if(arr.indexOf(answerNum) == -1){
                point++;
                arr.push(answerNum);
            }
            if(errorNum.indexOf(indexBtn) != -1){
                if(errorCase.indexOf(answerNum) != -1){
                    errorCase.splice(errorCase.indexOf(answerNum),1);
                }
                if(errorCase.length == 0){
                    errorNum.splice(errorNum.indexOf(indexBtn),1);
                    for(var i=0;i<errorArr[errorRemIndex][2].length;i++){
                        var strErr = JSON.stringify(errorArr[errorRemIndex][2][i]);
                        var strNow = JSON.stringify(finishArr[moduleIndex][2][indexBtn-1-onecLength-moreLength]);
                        if(strErr == strNow){
                            errorArr[errorRemIndex][2].splice(i,1);
                        }
                    }
                }
            }
        }else{
            if(arr.indexOf(answerNum) != -1){
                point--;
                arr.splice(arr.indexOf(answerNum),1);
            }
            if(errorNum.indexOf(indexBtn) == -1){
                errorNum.push(indexBtn);
                errorArr[errorRemIndex][2].push(finishArr[moduleIndex][2][indexBtn-1-onecLength-moreLength]);
                errorCase.push(answerNum);
            }
        }
        $(".num-wapper button").eq(answerNum-1).addClass("active");
    });
    /*案例题多选*/
    $(".case-wapper input[type=checkbox]").on("change",function(){
        var sureNum = 0,newAnswer;
        var answer = $(this).data("answer");
        var answerNum = $(this).data("num");
        arrAnswer = [];
        for(var i=0;i<$(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").length;i++){
            var dataNum = $(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").eq(i).data("num");
            if(dataNum == answerNum){
                if($(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").eq(i).prop("checked")){
                    sureNum++;
                    arrAnswer.push($(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").eq(i).next().text().charAt(0));
                }
            }
        }
        if(sureNum>0){
            $(".num-wapper button").eq(answerNum-1).addClass("active");
        }else{
            $(".num-wapper button").eq(answerNum-1).removeClass("active");
        }
        newAnswer = arrAnswer.sort().join("");
        if(newAnswer == answer){
            if(arr.indexOf(answerNum) == -1){
                point++;
                arr.push(answerNum);
            }
            if(errorNum.indexOf(indexBtn) != -1){
                if(errorCase.indexOf(answerNum) != -1){
                    errorCase.splice(errorCase.indexOf(answerNum),1);
                }
                if(errorCase.length == 0){
                    errorNum.splice(errorNum.indexOf(indexBtn),1);
                    for(var i=0;i<errorArr[errorRemIndex][2].length;i++){
                        var strErr = JSON.stringify(errorArr[errorRemIndex][2][i]);
                        var strNow = JSON.stringify(finishArr[moduleIndex][2][indexBtn-1-onecLength-moreLength]);
                        if(strErr == strNow){
                            errorArr[errorRemIndex][2].splice(i,1);
                        }
                    }
                }
            }
        }else{
            if(arr.indexOf(answerNum) != -1){
                point--;
                arr.splice(arr.indexOf(answerNum),1);
            }
            if(errorNum.indexOf(indexBtn) == -1){
                errorNum.push(indexBtn);
                errorArr[errorRemIndex][2].push(finishArr[moduleIndex][2][indexBtn-1-onecLength-moreLength]);
                errorCase.push(answerNum);
            }
        }
    });
    /*右侧按钮绑定点击事件*/
    $(".num-wapper").on("click","button",function(){
        indexBtn = parseInt($(this).text());
        arrAnswer = [];
        errorCase = [];
        if(indexBtn > onecLength+moreLength){
            $(".choose-box").addClass("hide");
            for(var i=0;i<$(".case-wapper .subject").length;i++){
                var caseIndex = $(".case-wapper .subject").eq(i).text();
                caseIndex = caseIndex.substring(0,caseIndex.indexOf("、"));
                if(indexBtn == parseInt(caseIndex)){
                    $(".case-wapper .subject").eq(i).parent().removeClass("hide");
                    indexBtn = parseInt($(".case-wapper .subject").eq(i).parent().index());
                }
            }
            $(".explain").text("(三)、案例题(1分一小题)");
        }else{
            choose(indexBtn);
        }
    });
    /*上一题、下一题*/
    $(".prev").on("click",function(){
        arrAnswer = [];
        errorCase = [];
        indexBtn--;
        if(indexBtn<1) indexBtn = 1;
        choose(indexBtn);
    });
    $(".next").on("click",function(){
        arrAnswer = [];
        errorCase = [];
        indexBtn++;
        var lengthMax = onecLength+moreLength;
        if(moduleIndex == 1&&finishArr[moduleIndex][2].length>0){
            lengthMax = onecLength+moreLength+finishArr[1][2].length;
        }
        if(indexBtn>lengthMax) indexBtn = lengthMax;
        choose(indexBtn);
    });
    /*切换题目*/
    function choose(indexNum){
        var index = indexNum;
        if(index <= onecLength){
            $(".explain").text("(一)、单项选择题(1分一小题)");
        }else if(index > onecLength&&index <= moreLength+onecLength){
            $(".explain").text("(二)、多项选择题(1分一小题)");
        }else{
            if(moduleIndex == 1&&finishArr[moduleIndex][2].length>0){
                $(".explain").text("(三)、案例题(1分一小题)");
            }
        }
        $(".choose-box").addClass("hide");
        $(".choose-box").eq(index-1).removeClass("hide");
    }
    /*单选选择答案*/
    $(".choose-wapper input[type=radio]").on("click",function(){
        var sure = $(this).next().text().charAt(0);
        var answer = finishArr[moduleIndex][0][indexBtn-1].yes;
        if(sure == answer){
            if(arr.indexOf(indexBtn) == -1){
                point++;
                arr.push(indexBtn);
            }
            if(errorNum.indexOf(indexBtn) != -1){
                errorNum.splice(errorNum.indexOf(indexBtn),1);
                for(var i=0;i<errorArr[errorRemIndex][0].length;i++){
                    var strErr = JSON.stringify(errorArr[errorRemIndex][0][i]);
                    var strNow = JSON.stringify(finishArr[moduleIndex][0][indexBtn-1]);
                    if(strErr == strNow){
                        errorArr[errorRemIndex][0].splice(i,1);
                    }
                }
            }
        }else{
            if(arr.indexOf(indexBtn) != -1){
                point--;
                arr.splice(arr.indexOf(indexBtn),1);
            }
            if(errorNum.indexOf(indexBtn) == -1){
                errorNum.push(indexBtn);
                errorArr[errorRemIndex][0].push(finishArr[moduleIndex][0][indexBtn-1]);
            }
        }
        $(".num-wapper button").eq(indexBtn-1).addClass("active");
    });
    /*多选选择答案*/
    $(".choose-wapper-more input[type=checkbox]").on("change",function(){
        var sureNum = 0,newAnswer;
        arrAnswer = [];
        for(var i=0;i<$(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").length;i++){
            if($(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").eq(i).prop("checked")){
                sureNum++;
                arrAnswer.push($(".choose-box").eq(indexBtn-1).find("input[type=checkbox]").eq(i).next().text().charAt(0));
            }
        }
        if(sureNum>0){
            $(".num-wapper button").eq(indexBtn-1).addClass("active");
        }else{
            $(".num-wapper button").eq(indexBtn-1).removeClass("active");
        }
        newAnswer = arrAnswer.sort().join("");
        var sureAnswer = finishArr[moduleIndex][1][indexBtn-1-onecLength].yes;
        if(newAnswer == sureAnswer){
            if(arr.indexOf(indexBtn) == -1){
                point++;
                arr.push(indexBtn);
            }
            if(errorNum.indexOf(indexBtn) != -1){
                errorNum.splice(errorNum.indexOf(indexBtn),1);
                for(var i=0;i<errorArr[errorRemIndex][1].length;i++){
                    var strErr = JSON.stringify(errorArr[errorRemIndex][1][i]);
                    var strNow = JSON.stringify(finishArr[moduleIndex][1][indexBtn-1-onecLength]);
                    if(strErr == strNow){
                        errorArr[errorRemIndex][1].splice(i,1);
                    }
                }
            }
        }else{
            if(arr.indexOf(indexBtn) != -1){
                point--;
                arr.splice(arr.indexOf(indexBtn),1);
            }
            if(errorNum.indexOf(indexBtn) == -1){
                errorNum.push(indexBtn);
                errorArr[errorRemIndex][1].push(finishArr[moduleIndex][1][indexBtn-1-onecLength]);
            }
        }
    });

    /*倒计时*/
    timer = setInterval(function(){
        if(second<10){
            $(".settimer p").text("本模块还剩："+minute+"分0"+second+"秒");
        }else{
            $(".settimer p").text("本模块还剩："+minute+"分"+second+"秒");
        }
        second--;
        if(second<0){
            second = 59;
            minute--;
        }
        if(minute<30&&minute>=0){
            $(".settimer p").addClass("red");
        }else if(minute<0){
            $(".prompt-sure").trigger("click");
            clearInterval(timer);
        }
    },1000);
}
/*交卷按钮*/
$(".btn-lg").on("click",function(){
    $(".prompt-box").removeClass("hide");
    var str = $(".topic-header span").eq(1).text();
    if(str == "模块二"){
        $(".prompt-content p").text("您确定提交 模块二 吗？");
    }
});
/*确定交卷*/
$(".prompt-sure").on("click",function(){
    var str = $(".topic-header span").eq(1).text();
    if(str != "模块二"){
        $(".topic-header span").eq(1).text("模块二");
        clearInterval(timer);
        $(".prompt-box").addClass("hide");
        module1 = point;
        point = 0;
        module(1,119);
    }else{
        clearInterval(timer);
        module2 = point;
        point = 0;
        $(".topic-box,.prompt-box").addClass("hide");
        $(".last-point").removeClass("hide");
        $(".module1-point span").text(module1);
        $(".module2-point span").text(module2);
    }
});
/*关闭提示框*/
$(".prompt-close,.icon-close").on("click",function(){
    $(".prompt-box").addClass("hide");
});
/*再一次考试*/
$(".again").on("click",function(){
    $(".last-point").addClass("hide");
    $(".topic-box").removeClass("hide");
    $(".topic-header span").eq(1).text("模块一");
    reset();
    init(initArr);
    module(0,89);
});
/*回到首页*/
$(".back-home").on("click",function(){
    $(".last-point,.topic-box,.prompt-box,.practice-box,.changePwd").addClass("hide");
    $(".section").removeClass("hide");
    $(".topic-header span").eq(1).text("模块一");
    prIndex = 1;
    $(".practice-content-box").html("");
    $(".practice-header span").eq(2).text("第1题，");
    $(".practice-header input").val("");
    $(".label").addClass("hide");
    $(".nav-tabs li").removeClass("active");
    $(".nav-tabs li").eq(0).addClass("active");
    reset();
    initArr = [[],[],[]];
    $("b").remove();
});
/*去练习*/
$(".start-practice").on("click",function(){
    $(".last-point").addClass("hide");
    $(".section").addClass("hide");
    $(".loading-box").removeClass("hide");
    setTimeout(function(){
        var topicNum = initArr[0].length+initArr[1].length+initArr[2].length;
        $(".practice-header .bold").text(ksName);
        $(".practice-header .mar-let-8").text("共"+topicNum+"题");
        $(".practice-box").removeClass("hide");
        practiceInit(initArr);
    },100);
});
/*退出*/
$(".nav-tabs a").eq(3).on("click",function(){
    window.location.href = "login.html";
});
/*进入考试*/
$("tbody").on("click",".btn-success",function(){
    var name = $(this).closest("tr").find("td").eq(1).text();
    ksName = name;
    $(".section").addClass("hide");
    $(".topic-box").removeClass("hide");
    $(".topic-header span").eq(0).text("["+name+"]");
    errorRemIndex = $(this).data("num");
    errorArr[errorRemIndex] = [[],[],[]];
    var typeArr;
    switch (name){
        case "标准员":
            typeArr = "standardArr";
            break;
        case "材料员":
            typeArr = "materialArr";
            break;
        case "机械员":
            typeArr = "mechanicsArr";
            break;
        case "劳务员":
            typeArr = "labourArr";
            break;
        case "资料员":
            typeArr = "dataArr";
            break;
        case "市政工程施工员":
            typeArr = "engConstructionArr";
            break;
        case "市政工程质量员":
            typeArr = "engQualityArr";
            break;
        case "土建安全员":
            typeArr = "securityArr";
            break;
        case "土建施工员":
            typeArr = "tuConstructionArr";
            break;
        case "土建质量员":
            typeArr = "tuQualityArr";
            break;
        case "设备安装施工员":
            typeArr = "sheConstructionArr";
            break;
        case "设备安装质量员":
            typeArr = "sheQualityArr";
            break;
    }
    $.ajax({
        url:"php/select-topic.php",
        type:"POST",
        data:{
            typeName:typeArr,
        },
        success:function(res){
            var arrData = JSON.parse(res);
            //console.log(arrData);
            for(var i=0;i<arrData[0].length;i++){
                var jsonData = JSON.parse(arrData[0][i]);
                //console.log(i,jsonData);
                var strAnswer = jsonData.answer;
                var a = strAnswer.substring(0,strAnswer.indexOf("B、"));
                var b = strAnswer.substring(strAnswer.indexOf("B、"),strAnswer.indexOf("C、"));
                var c = strAnswer.substring(strAnswer.indexOf("C、"),strAnswer.indexOf("D、"));
                var d = strAnswer.substring(strAnswer.indexOf("D、"));
                jsonData.a = a;
                jsonData.b = b;
                jsonData.c = c;
                jsonData.d = d;
                delete jsonData.answer;
                initArr[0].push(jsonData);
            }
            for(var i=0;i<arrData[1].length;i++){
                var jsonDataMore = JSON.parse(arrData[1][i]);
                //console.log(i,jsonDataMore);
                var strAnswerMore = jsonDataMore.answer;
                var aMore = strAnswerMore.substring(0,strAnswerMore.indexOf("B、"));
                var bMore = strAnswerMore.substring(strAnswerMore.indexOf("B、"),strAnswerMore.indexOf("C、"));
                var cMore = strAnswerMore.substring(strAnswerMore.indexOf("C、"),strAnswerMore.indexOf("D、"));
                if(strAnswerMore.indexOf("E、") == -1){
                    var dMore = strAnswerMore.substring(strAnswerMore.indexOf("D、"));
                }else{
                    var dMore = strAnswerMore.substring(strAnswerMore.indexOf("D、"),strAnswerMore.indexOf("E、"));
                    var eMore = strAnswerMore.substring(strAnswerMore.indexOf("E、"));
                    jsonDataMore.e = eMore;
                }
                jsonDataMore.a = aMore;
                jsonDataMore.b = bMore;
                jsonDataMore.c = cMore;
                jsonDataMore.d = dMore;
                delete jsonDataMore.answer;
                initArr[1].push(jsonDataMore);
            }
            for(var i=0;i<arrData[2].length;i++){
                var jsonDataCase = JSON.parse(arrData[2][i]);
                //console.log(i,jsonDataCase);
                for(var j=0;j<jsonDataCase.content.length;j++){
                    var jsonCase = jsonDataCase.content[j];
                    var strCase = jsonCase.answer;
                    var aCase = strCase.substring(0,strCase.indexOf("B、"));
                    if(strCase.indexOf("C、") != -1){
                        var bCase = strCase.substring(strCase.indexOf("B、"),strCase.indexOf("C、"));
                        var cCase = strCase.substring(strCase.indexOf("C、"),strCase.indexOf("D、"));
                        if(strCase.indexOf("E、") == -1){
                            var dCase = strCase.substring(strCase.indexOf("D、"));
                        }else{
                            var dCase = strCase.substring(strCase.indexOf("D、"),strCase.indexOf("E、"));
                            var eCase = strCase.substring(strCase.indexOf("E、"));
                            jsonCase.e = eCase;
                        }
                        jsonCase.a = aCase;
                        jsonCase.b = bCase;
                        jsonCase.c = cCase;
                        jsonCase.d = dCase;
                    }else{
                        var bCase = strCase.substring(strCase.indexOf("B、"));
                        jsonCase.a = aCase;
                        jsonCase.b = bCase;
                    }
                    delete jsonCase.answer;
                }
                initArr[2].push(jsonDataCase);
            }
            // console.log(initArr)
            init(initArr);
            module(0,89);
        }
    });
});
/*考试初始化*/
function reset(){
    finishArr = [[[],[]],[[],[],[]]];
    remember1 = [];
    remember2 = [];
    remember3 = [];
    clearInterval(timer);
    module1 = 0;
    module2 = 0;
    point = 0;
}
/*------------------------------- 练习部分 ------------------------------------------*/
var prIndex = 1;
/*进入练习*/
$("tbody").on("click",".go-practice",function(){
    $(".section").addClass("hide");
    $(".loading-box").removeClass("hide");
    var name = $(this).closest("tr").find("td").eq(1).text();
    if(initArr[0].length == 0){
        var typeArr;
        switch (name){
            case "标准员":
                typeArr = "standardArr";
                break;
            case "材料员":
                typeArr = "materialArr";
                break;
            case "机械员":
                typeArr = "mechanicsArr";
                break;
            case "劳务员":
                typeArr = "labourArr";
                break;
            case "资料员":
                typeArr = "dataArr";
                break;
            case "市政工程施工员":
                typeArr = "engConstructionArr";
                break;
            case "市政工程质量员":
                typeArr = "engQualityArr";
                break;
            case "土建安全员":
                typeArr = "securityArr";
                break;
            case "土建施工员":
                typeArr = "tuConstructionArr";
                break;
            case "土建质量员":
                typeArr = "tuQualityArr";
                break;
            case "设备安装施工员":
                typeArr = "sheConstructionArr";
                break;
            case "设备安装质量员":
                typeArr = "sheQualityArr";
                break;
        }
        $.ajax({
            url:"php/select-topic.php",
            type:"POST",
            data:{
                typeName:typeArr,
            },
            success:function(res){
                var arrData = JSON.parse(res);
                for(var i=0;i<arrData[0].length;i++){
                    var jsonData = JSON.parse(arrData[0][i]);
                    var strAnswer = jsonData.answer;
                    var a = strAnswer.substring(0,strAnswer.indexOf("B"));
                    var b = strAnswer.substring(strAnswer.indexOf("B"),strAnswer.indexOf("C"));
                    var c = strAnswer.substring(strAnswer.indexOf("C"),strAnswer.indexOf("D"));
                    var d = strAnswer.substring(strAnswer.indexOf("D"));
                    jsonData.a = a;
                    jsonData.b = b;
                    jsonData.c = c;
                    jsonData.d = d;
                    delete jsonData.answer;
                    initArr[0].push(jsonData);
                }
                for(var i=0;i<arrData[1].length;i++){
                    var jsonDataMore = JSON.parse(arrData[1][i]);
                    var strAnswerMore = jsonDataMore.answer;
                    var aMore = strAnswerMore.substring(0,strAnswerMore.indexOf("B"));
                    var bMore = strAnswerMore.substring(strAnswerMore.indexOf("B"),strAnswerMore.indexOf("C"));
                    var cMore = strAnswerMore.substring(strAnswerMore.indexOf("C"),strAnswerMore.indexOf("D"));
                    if(strAnswerMore.indexOf("E") == -1){
                        var dMore = strAnswerMore.substring(strAnswerMore.indexOf("D"));
                    }else{
                        var dMore = strAnswerMore.substring(strAnswerMore.indexOf("D"),strAnswerMore.indexOf("E"));
                        var eMore = strAnswerMore.substring(strAnswerMore.indexOf("E"));
                        jsonDataMore.e = eMore;
                    }
                    jsonDataMore.a = aMore;
                    jsonDataMore.b = bMore;
                    jsonDataMore.c = cMore;
                    jsonDataMore.d = dMore;
                    delete jsonDataMore.answer;
                    initArr[1].push(jsonDataMore);
                }
                for(var i=0;i<arrData[2].length;i++){
                    var jsonDataCase = JSON.parse(arrData[2][i]);
                    for(var j=0;j<jsonDataCase.content.length;j++){
                        var jsonCase = jsonDataCase.content[j];
                        var strCase = jsonCase.answer;
                        var aCase = strCase.substring(0,strCase.indexOf("B"));
                        if(strCase.indexOf("C") != -1){
                            var bCase = strCase.substring(strCase.indexOf("B"),strCase.indexOf("C"));
                            var cCase = strCase.substring(strCase.indexOf("C"),strCase.indexOf("D"));
                            if(strCase.indexOf("E") == -1){
                                var dCase = strCase.substring(strCase.indexOf("D"));
                            }else{
                                var dCase = strCase.substring(strCase.indexOf("D"),strCase.indexOf("E"));
                                var eCase = strCase.substring(strCase.indexOf("E"));
                                jsonCase.e = eCase;
                            }
                            jsonCase.a = aCase;
                            jsonCase.b = bCase;
                            jsonCase.c = cCase;
                            jsonCase.d = dCase;
                        }else{
                            var bCase = strCase.substring(strCase.indexOf("B"));
                            jsonCase.a = aCase;
                            jsonCase.b = bCase;
                        }
                        delete jsonCase.answer;
                    }
                    initArr[2].push(jsonDataCase);
                }
            }
        });
    }
    setTimeout(function(){
        var topicNum = initArr[0].length+initArr[1].length+initArr[2].length;
        $(".practice-header .bold").text(name);
        $(".practice-header .mar-let-8").text("共"+topicNum+"题");
        $(".practice-box").removeClass("hide");
        practiceInit(initArr);
    },100);
});
function practiceInit(prarr){
    $(".jump,.back-home-pr,.pr-next,.pr-prev,.practice-content-box input[type=radio],.practice-case-wapper input[type=radio]").off("click");
    $(".practice-content-box input[type=checkbox],.practice-case-wapper input[type=checkbox]").off("change");
    var prarrAnswer = [];
    /*生成练习题*/
    for(var i=0;i<prarr[0].length;i++){
        var practiceWapper = $("<div class='practice-radio practice-same hide'></div>");
        var practicePrompt = $("<p class='practice-prompt'><span>单选题</span></p>");
        var practiceTitle = $("<p class='practice-title'>"+(i+1)+"、"+prarr[0][i].subject+"</p>");
        var pa = $("<div><input type='radio' name='pone"+i+"' id='pa"+i+"'><label for='pa"+i+"'>"+prarr[0][i].a+"</label></div>");
        var pb = $("<div><input type='radio' name='pone"+i+"' id='pb"+i+"'><label for='pb"+i+"'>"+prarr[0][i].b+"</label></div>");
        var pc = $("<div><input type='radio' name='pone"+i+"' id='pc"+i+"'><label for='pc"+i+"'>"+prarr[0][i].c+"</label></div>");
        var pd = $("<div><input type='radio' name='pone"+i+"' id='pd"+i+"'><label for='pd"+i+"'>"+prarr[0][i].d+"</label></div>");
        practiceWapper.append(practicePrompt).append(practiceTitle).append(pa).append(pb).append(pc).append(pd);
        $(".practice-content-box").append(practiceWapper);
        $(".practice-content-box .practice-radio").eq(0).removeClass("hide");
    }
    for(var i=0;i<prarr[1].length;i++){
        var practiceWapperCk = $("<div class='practice-checkbox practice-same hide'></div>");
        var practicePromptCk = $("<p class='practice-prompt'><span>多选题</span></p>");
        var practiceTitleCk = $("<p class='practice-title'>"+(i+1+prarr[0].length)+"、"+prarr[1][i].subject+"</p>");
        var paa = $("<div><input type='checkbox' id='paa"+i+"'><label for='paa"+i+"'>"+prarr[1][i].a+"</label></div>");
        var pbb = $("<div><input type='checkbox' id='pbb"+i+"'><label for='pbb"+i+"'>"+prarr[1][i].b+"</label></div>");
        var pcc = $("<div><input type='checkbox' id='pcc"+i+"'><label for='pcc"+i+"'>"+prarr[1][i].c+"</label></div>");
        var pdd = $("<div><input type='checkbox' id='pdd"+i+"'><label for='pdd"+i+"'>"+prarr[1][i].d+"</label></div>");
        practiceWapperCk.append(practicePromptCk).append(practiceTitleCk).append(paa).append(pbb).append(pcc).append(pdd);
        if(prarr[1][i].e){
            var pee = $("<div><input type='checkbox' id='pee"+i+"'><label for='pee"+i+"'>"+prarr[1][i].e+"</label></div>");
            practiceWapperCk.append(pee);
        }
        $(".practice-content-box").append(practiceWapperCk);
    }
    if(prarr[2]&&prarr[2].length>0){
        for(var i=0;i<prarr[2].length;i++){
            var prCaseWappper = $("<div class='practice-case-wapper hide practice-same'></div>");
            var practicePromptCs = $("<p class='practice-prompt'><span>案例题</span></p>");
            var practiceCaseTitle = $("<div class='practice-case-title'>"+(i+1+prarr[0].length+prarr[1].length)+"、"+prarr[2][i].title+"</div>");
            prCaseWappper.append(practicePromptCs).append(practiceCaseTitle);
            for(var j=0;j<prarr[2][i].content.length;j++){
                if(prarr[2][i].content[j].yes.length == 1){
                    var pRsubject = $("<p class='subject'>"+(j+1)+"、"+prarr[2][i].content[j].subject+"</p>");
                    var pRcAa = $("<div><input type='radio' data-answer='"+prarr[2][i].content[j].yes+"' data-num='a"+j+i+"' name='pRcAonec"+j+i+"' id='pRcAa"+j+i+"'><label for='pRcAa"+j+i+"'>"+prarr[2][i].content[j].a+"</label></div>");
                    var pRcAb = $("<div><input type='radio' data-answer='"+prarr[2][i].content[j].yes+"' data-num='a"+j+i+"' name='pRcAonec"+j+i+"' id='pRcAb"+j+i+"'><label for='pRcAb"+j+i+"'>"+prarr[2][i].content[j].b+"</label></div>");
                    if(prarr[2][i].content[j].c){
                        var pRcAc = $("<div><input type='radio' data-answer='"+prarr[2][i].content[j].yes+"' data-num='a"+j+i+"' name='pRcAonec"+j+i+"' id='pRcAc"+j+i+"'><label for='pRcAc"+j+i+"'>"+prarr[2][i].content[j].c+"</label></div>");
                        var pRcAd = $("<div><input type='radio' data-answer='"+prarr[2][i].content[j].yes+"' data-num='a"+j+i+"' name='pRcAonec"+j+i+"' id='pRcAd"+j+i+"'><label for='pRcAd"+j+i+"'>"+prarr[2][i].content[j].d+"</label></div>");
                        prCaseWappper.append(pRsubject).append(pRcAa).append(pRcAb).append(pRcAc).append(pRcAd);
                    }else{
                        prCaseWappper.append(pRsubject).append(pRcAa).append(pRcAb);
                    }
                    var label = $("<div class='a"+j+i+"'><span class='label label-success hide'>正确</span><span class='label label-danger hide'>错误</span></div>");
                    prCaseWappper.append(label);
                }else{
                    var pRsubjectMore = $("<p class='subject'>"+(j+1)+"、"+prarr[2][i].content[j].subject+"</p>");
                    var pRcAaa = $("<div><input type='checkbox' data-answer='"+prarr[2][i].content[j].yes+"' data-num='b"+j+i+"' id='pRcAaa"+j+i+"'><label for='pRcAaa"+j+i+"'>"+prarr[2][i].content[j].a+"</label></div>");
                    var pRcAbb = $("<div><input type='checkbox' data-answer='"+prarr[2][i].content[j].yes+"' data-num='b"+j+i+"' id='pRcAbb"+j+i+"'><label for='pRcAbb"+j+i+"'>"+prarr[2][i].content[j].b+"</label></div>");
                    var pRcAcc = $("<div><input type='checkbox' data-answer='"+prarr[2][i].content[j].yes+"' data-num='b"+j+i+"' id='pRcAcc"+j+i+"'><label for='pRcAcc"+j+i+"'>"+prarr[2][i].content[j].c+"</label></div>");
                    var pRcAdd = $("<div><input type='checkbox' data-answer='"+prarr[2][i].content[j].yes+"' data-num='b"+j+i+"' id='pRcAdd"+j+i+"'><label for='pRcAdd"+j+i+"'>"+prarr[2][i].content[j].d+"</label></div>");
                    prCaseWappper.append(pRsubjectMore).append(pRcAaa).append(pRcAbb).append(pRcAcc).append(pRcAdd);
                    if(prarr[2][i].content[j].e){
                        var pRcAee = $("<div><input type='checkbox' data-answer='"+prarr[2][i].content[j].yes+"' data-num='b"+j+i+"' id='pRcAee"+j+i+"'><label for='pRcAee"+j+i+"'>"+prarr[2][i].content[j].e+"</label></div>");
                        prCaseWappper.append(pRcAee);
                    }
                    var pRlabel = $("<div class='b"+j+i+"'><span class='label label-success hide'>正确</span><span class='label label-danger hide'>错误</span></div>");
                    prCaseWappper.append(pRlabel);
                }
            }
            $(".practice-content-box").append(prCaseWappper);
        }
    }
    $(".loading-box").addClass("hide");
    /*案例题单选选择答案*/
    $(".practice-case-wapper input[type=radio]").on("click",function(){
        var sure = $(this).next().text().charAt(0);
        var answer = $(this).data("answer");
        var caseIndex = $(this).data("num");
        if(sure == answer){
            $("."+caseIndex).find(".label").addClass("hide");
            $("."+caseIndex).find(".label-success").removeClass("hide");
        }else{
            $("."+caseIndex).find(".label").addClass("hide");
            $("."+caseIndex).find(".label-danger").removeClass("hide");
        }
    });
    /*案例题多选选择答案*/
    $(".practice-case-wapper input[type=checkbox]").on("change",function(){
        var prnewAnswer;
        var cKAnswer = $(this).data("answer");
        var cKcaseIndex = $(this).data("num");
        prarrAnswer = [];
        for(var i=0;i<$(".practice-same").eq(prIndex-1).find("input[type=checkbox]").length;i++){
            var dataNum = $(".practice-same").eq(prIndex-1).find("input[type=checkbox]").eq(i).data("num");
            if(dataNum == cKcaseIndex){
                if($(".practice-same").eq(prIndex-1).find("input[type=checkbox]").eq(i).prop("checked")){
                    prarrAnswer.push($(".practice-same").eq(prIndex-1).find("input[type=checkbox]").eq(i).next().text().charAt(0));
                }
            }
        }
        prnewAnswer = prarrAnswer.sort().join("");
        if(prnewAnswer == cKAnswer){
            $("."+cKcaseIndex).find(".label").addClass("hide");
            $("."+cKcaseIndex).find(".label-success").removeClass("hide");
        }else{
            $("."+cKcaseIndex).find(".label").addClass("hide");
            $("."+cKcaseIndex).find(".label-danger").removeClass("hide");
        }
    });
    /*上一题*/
    $(".pr-prev").on("click",function(){
        $(".practice-content-box input[type=radio]").attr("checked",false);
        $(".practice-content-box input[type=checkbox]").attr("checked",false);
        prIndex--;
        if(prIndex < 1) prIndex = 1;
        $(".practice-same").addClass("hide");
        $(".practice-same").eq(prIndex-1).removeClass("hide");
        $(".practice-header span").eq(2).text("第"+prIndex+"题，");
        $(".label").addClass("hide");
    });
    /*下一题*/
    $(".pr-next").click(function(){
        $(".practice-content-box input[type=radio]").attr("checked",false);
        $(".practice-content-box input[type=checkbox]").attr("checked",false);
        prIndex++;
        if(prarr[2]&&prarr[2].length>0){
            if(prIndex > prarr[0].length + prarr[1].length + prarr[2].length) prIndex = prarr[0].length + prarr[1].length + prarr[2].length;
        }else{
            if(prIndex > prarr[0].length + prarr[1].length) prIndex = prarr[0].length + prarr[1].length;

        }
        $(".practice-same").addClass("hide");
        $(".practice-same").eq(prIndex-1).removeClass("hide");
        $(".practice-header span").eq(2).text("第"+prIndex+"题，");
        $(".label").addClass("hide");
    });
    /*跳转到目标题*/
    $(".jump").on("click",function(){
        $(".practice-content-box input[type=radio]").attr("checked",false);
        $(".practice-content-box input[type=checkbox]").attr("checked",false);
        var jumpNum = parseInt($(".practice-header input").val());
        if(prarr[2]&&prarr[2].length>0){
            if(jumpNum>=1&&jumpNum<=prarr[0].length + prarr[1].length + prarr[2].length){
                $(".practice-same").addClass("hide");
                $(".practice-same").eq(jumpNum-1).removeClass("hide");
                $(".practice-header span").eq(2).text("第"+jumpNum+"题，");
                $(".practice-header input").val("");
                $(".label").addClass("hide");
                prIndex = jumpNum;
            }else{
                return;
            }
        }else{
            if(jumpNum>=1&&jumpNum<=prarr[0].length + prarr[1].length){
                $(".practice-same").addClass("hide");
                $(".practice-same").eq(jumpNum-1).removeClass("hide");
                $(".practice-header span").eq(2).text("第"+jumpNum+"题，");
                $(".practice-header input").val("");
                $(".label").addClass("hide");
                prIndex = jumpNum;
            }else{
                return;
            }
        }
    });
    /*单选选择答案*/
    $(".practice-radio input[type=radio]").on("click",function(){
        var sure = $(this).next().text().charAt(0);
        var answer = prarr[0][prIndex-1].yes;
        if(sure == answer){
            $(".label").addClass("hide");
            $(".label-success").removeClass("hide");
        }else{
            $(".label").addClass("hide");
            $(".label-danger").removeClass("hide");
        }
    });
    /*多选选择答案*/
    $(".practice-checkbox input[type=checkbox]").on("change",function(){
        var prnewAnswer;
        prarrAnswer = [];
        var prsureAnswer = prarr[1][prIndex-1-prarr[0].length].yes;
        for(var i=0;i<$(".practice-same").eq(prIndex-1).find("input[type=checkbox]").length;i++){
            if($(".practice-same").eq(prIndex-1).find("input[type=checkbox]").eq(i).prop("checked")){
                prarrAnswer.push($(".practice-same").eq(prIndex-1).find("input[type=checkbox]").eq(i).next().text().charAt(0));
            }
        }
        prnewAnswer = prarrAnswer.sort().join("");
        if(prnewAnswer == prsureAnswer){
            $(".label").addClass("hide");
            $(".label-success").removeClass("hide");
        }else{
            $(".label").addClass("hide");
            $(".label-danger").removeClass("hide");
        }
    });
    /*返回首页*/
    $(".back-home-pr").on("click",function(){
        $(".section").removeClass("hide");
        $(".practice-box").addClass("hide");
        prIndex = 1;
        $(".practice-content-box").html("");
        $(".practice-header span").eq(2).text("第1题，");
        $(".practice-header input").val("");
        $(".label").addClass("hide");
        $("b").remove();
    });
}
/*------------------------------- 错题部分 ------------------------------------------*/
$("tbody").on("click",".go-error",function(){
    var name1 = $(this).closest("tr").find("td").eq(1).text();
    var errorIndex = $(this).data("num");
    var topicNum1 = errorArr[errorIndex][0].length+errorArr[errorIndex][1].length+errorArr[errorIndex][2].length;
    if(topicNum1 > 0){
        $(".section").addClass("hide");
        $(".loading-box").removeClass("hide");
        $(".practice-header .bold").text(name1);
        $(".practice-header .mar-let-8").text("共"+topicNum1+"题");
        var errText = $("<b style='color:red'>[错题模式]</b>")
        $(".bold").after(errText);
        setTimeout(function(){
            $(".practice-box").removeClass("hide");
            practiceInit(errorArr[errorIndex]);
        },100);
    }else{
        alert("上次考试没有错题");
    }
});
/*------------------------------- 修改密码 ------------------------------------------*/
$(".btnPwd").on("click",function(){
    $(".back-home").trigger("click");
    $(".section").addClass("hide");
    $(".changePwd").removeClass("hide");
    $(".nav-tabs li").removeClass("active");
    $(this).parent().addClass("active");
    $(".changePwd input").val("");
});