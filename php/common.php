<?php
    $con = mysql_connect("w.rdc.sae.sina.com.cn:3306","zj4mjkzn0m","lwxl025xi30y51l53iwyil4k15530j0kkkmyywmk");
    if(!$con){
        die("数据库连接失败");
    };
    mysql_query("SET NAMES UTF8");
    mysql_select_db("app_jdylxlx88");
?>