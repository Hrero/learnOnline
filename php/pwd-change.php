<?php 
	include "common.php";
	$name = $_REQUEST["user"];
	$oldPwd = $_REQUEST["oldPwd"];
	$newPwd = $_REQUEST["newPwd"];
	$sql = "SELECT * FROM user WHERE user='$name' and pwd='$oldPwd'";
	$res = mysql_query($sql);
	$num = mysql_num_rows($res);
	if($num>0){
		$sql = "UPDATE user SET pwd='$newPwd' WHERE user=$name";
		$res = mysql_query($sql);
		if($res){
		    echo "success";
		}else{
		    echo "errorNew";
		}
	}else{
		echo "errorOld";
	}
	mysql_close($con);
 ?>