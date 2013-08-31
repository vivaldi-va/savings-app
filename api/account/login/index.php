<?php

include_once '../../../includes/constants.php';

$connection = new mysqli(DB_LOCATION, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($connection->connect_error)
{
	$return['error'] = $connection->connect_error;
	exit(json_encode(array("error" => $connection->connect_error)));
}


// check if email or username received
if (isset($_REQUEST['userid'])) {
	$userId = mysql_real_escape_string($_REQUEST['email']);
} else
	exit(json_encode(array("error" => "no email or username")));


// check if password received
if (isset($_REQUEST['pass'])) {
	$pass = mysql_real_escape_string($_REQUEST['pass']);
} else
	exit(json_encode(array("error" => "no password")));

// check if remember-me received
if (isset($_REQUEST['pass'])) {
	$pass = mysql_real_escape_string($_REQUEST['pass']);
}

/**
 * check if the user email exists in the system
 * 
 * @param string $email
 * @return boolean: true if user exists, else false.
 */
function _userExists($email)
{
	if ($result = $connection->query("SELECT id FROM users WHERE email = \"%$email%\""))
		return true;
	else
		return false;
}

/**
 * varify the user's entered password is correct
 * 
 * done by reconstructing the entered password using the 
 * salt drawn from the user row, and comparing it against the 
 * stored salted-hash
 * 
 * @param string $enteredPass
 * @param string $email
 * @return boolean: true if pass matches
 */
function _validatePass($enteredPass, $email) {
	
	$dbResult = $connection->query("
			SELECT password, salt 
			FROM users 
			WHERE email = \"%$email%\"");
	$dbArray = $dbResult->fetch_assoc();
	
	$salt = $dbArray['salt'];
	$pass = $dbArray['password'];
	
	$reconstructedPass = md5( md5($enteredPass) . md5($salt) );
	
	if ($reconstructedPass == $pass) {
		return true;
	}
	
	return false;
}

/*
 * check the user exists, and if so
 * whether the password is correct
 */

if (!_userExists($email)) 
	exit(json_encode(array("success" => 0, "message" => "user not found")));
elseif (!_validatePass($pass, $email))
	exit(json_encode(array("success" => 0, "message" => "invalid password")));

/*
 * if so, procede with login process.
 */


if (isset($_REQUEST['remember'])) 
{
	setcookie('savings_email', $email, 60*60*24*100, '/');
}

$_SESSION['email'] = $email;

exit(json_encode(array("success" => 1, "message" => "login success")));




