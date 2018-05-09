<?php
	include "common.php";
	$typeName = $_REQUEST["typeName"];
	$sql = "SELECT onec FROM $typeName";
	$res = mysql_query($sql);
	$sql1 = "SELECT more FROM $typeName";
	$res1 = mysql_query($sql1);
	$sql2 = "SELECT caseaa FROM $typeName";
	$res2 = mysql_query($sql2);
	$arrData = array();
	$arr = array();
	while($row = mysql_fetch_row($res)){
		if($row[0]){
			array_push($arr,$row[0]);
		}
	};
	$arr1 = array();
	while($row1 = mysql_fetch_row($res1)){
		if($row1[0]){
			array_push($arr1,$row1[0]);
		}
	};
	$arr2 = array();
	while($row2 = mysql_fetch_row($res2)){
		if($row2[0]){
			array_push($arr2,$row2[0]);
		}
	};
	array_push($arrData,$arr);
	array_push($arrData,$arr1);
	array_push($arrData,$arr2);
	echo json_encode($arrData);
	mysql_close($con);
 ?>