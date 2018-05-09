<?php
	include "common.php";
	$oldPwd = $_REQUEST["oldPwd"];
	$newPwd = $_REQUEST["newPwd"];
    $sql = "UPDATE admin SET pwd='$newPwd' WHERE pwd=$oldPwd";
    $res = mysql_query($sql);
    if($res){
        echo "success";
    }else{
        echo "errorNew";
    }
	mysql_close($con);
 ?>