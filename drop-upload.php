<?php
$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
if ($fn) {
	// AJAX call
	file_put_contents(
		'uploads/' . $fn,
		file_get_contents('php://input')
	);
	exit();
}
else {
	// form submit
	$oldbrowser = isset($_POST['oldBrowser']) ? (true):(false);
	
	if(!$oldbrowser){
		$files = $_FILES['file_select'];
	
		foreach ($files['error'] as $id => $err) {
			if ($err == UPLOAD_ERR_OK) {
				$fn = $files['name'][$id];
				move_uploaded_file(
					$files['tmp_name'][$id],
					'uploads/' . $fn
				);
			}
		}
	}else {
		$date = date("YmdHis");
		$photoName = "uploads/".$date.strtolower(substr($_FILES['file_select']['name'],-4));
		move_uploaded_file($_FILES['file_select']['tmp_name'], $photoName);
		echo $photoName;
	}
}
?>