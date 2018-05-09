<?php
	include "common.php";
	$name = $_REQUEST["userName"];
	$sql = "SELECT type,createtime FROM user WHERE user='$name'";
	$res = mysql_query($sql);
	$arr = array();
	while($row = mysql_fetch_assoc($res)){
    	array_push($arr,$row);
	};
	echo json_encode($arr);
	mysql_close($con);
 ?>