<?php
include_once '../../../includes/constants.php';


$return = array('logged_in' => false);
$email = false;
$connection = new mysqli(DB_LOCATION, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($connection->connect_error) 
{
	$return['error'] = $connection->connect_error;
	exit(json_encode($return));
}

/**
 * authenticate the user's credentials to ensure it's the right person who logged
 * in in the first place.
 * 
 * if their email (and a unique identifier who's value is to be determined) is found, 
 * return true. 
 * Otherwise return false.
 * 
 * @param string $email: user email from session or cookie
 * @param string $userId: an MD5 hash from session or cookie, sourced from a unique and static user attribute.
 * @return boolean
 */
function _authenticate($email, $userId=null) 
{
	if (!email)
		return false;
	
	
	$result = $connection->query("SELECT email FROM users WHERE email = $email");
	if ($result->fetch_assoc())
		return true;
	else
		return false;			
} 




/*
 * check for cookies
 */
if (isset($_COOKIE['savings_email'])) 
{
	$email = $_SESSION['email'] = $_COOKIE['savings_email'];		
}
/*
 * check for session if there's no cookies 
 */
else if(isset($_SESSION['email'])) 
{
	$email = $_SESSION['email'];
}


 
/*
 * if there are either session vars or cookies set,
 * check the email and hashed userID against the 
 * details stored on the database
 */
if (_authenticate($email)) {
	$return['logged_in'] = true;
}

$connection->close();

exit(json_encode($return));

 