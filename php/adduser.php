<?php 
	include "common.php";
	$addname = $_REQUEST["addname"];
	$addpwd = $_REQUEST["addpwd"];
	$addtype = $_REQUEST["addtype"];
	$sql = "SELECT * FROM  user WHERE user='$addname'";
	$res = mysql_query($sql);
	$num = mysql_num_rows($res);
	if($num>0){
		echo "repeat";
	}else{
		$sql1 = "INSERT INTO user(user,pwd,type) VALUES ('$addname','$addpwd','$addtype')";
		$res1 = mysql_query($sql1);
		if($res1){
			echo "success";
		}else{
			echo "error";
		}
	}
	mysql_close($con);
 ?>