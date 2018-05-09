<?php 
	include "common.php";
	$name = $_REQUEST["loginuser"];
	$pwd = $_REQUEST["loginpwd"];
	$sql = "SELECT * FROM user WHERE user='$name' and pwd='$pwd'";
	$res = mysql_query($sql);
	$num = mysql_num_rows($res);
	if($num>0){
		echo "success";
	}else{
		echo "error";
	}
	mysql_close($con);
 ?>