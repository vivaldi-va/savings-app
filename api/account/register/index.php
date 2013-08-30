<?php
include_once '../../../includes/constants.php';

$return = array();

$connection = new mysqli(DB_LOCATION, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($connection->connect_error)
{
	$return['error'] = $connection->connect_error;
	exit(json_encode($return));
}


function _userExists($email) {
	
	$query = $connection->query("SELECT email FROM users WHERE email = $email");
	if ($result = $query->fetch_assoc())
		return true;
	else 
		return false;
}


/**
 * Generate a random 5 character string, to 'salt' the md5-hashed password which is stored
 * on the database. The hashed password string is concatenated with the hashed Salt string, and
 * then this is hashed again before being stored.
 * This method increases the difficulty in de-coding password hashes by several
 * orders of magnitude, making it necessary to run 3 rounds of decryption for
 * any one password.
 * 
 * @param string $pass: sanitized password inputted by the user.
 * @return string: the encoded and salted password
 */

function _generateSalt() {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$salt = '';
	for ($i = 0; $i < 5; $i++)
	{
		$salt .= $characters[rand(0, strlen($characters) - 1)];
	}
	
	return $salt;
}




function _addUser($email, $username, $password, $salt, $ip) 
{
	$result = $connection->query("INSERT INTO users (id, email, username, password, salt, date_created, created_ip, varified, invited, last_log_date, last_log_ip) 
			VALUES (NULL, $email, $username, $password, $salt, CURRENT_TIMESTAMP, $ip, 0, 0, CURRENT_TIMESTAMP, $ip)");
	if ($result) {
		return true;
	}	
	
	return false;
}




/*
 * check if all the required details 
 * have been received
 */

// check if email received
if (isset($_REQUEST['email'])) {
	$email = mysql_real_escape_string($_REQUEST['email']);
} else
	exit(json_encode(array("error" => "no email")));
	
// check if username received
if (isset($_REQUEST['name'])) {
	$email = mysql_real_escape_string($_REQUEST['name']);
} else
	exit(json_encode(array("error" => "no username")));

// check if password received
if (isset($_REQUEST['pass'])) {
	$email = mysql_real_escape_string($_REQUEST['pass']);
} else
	exit(json_encode(array("error" => "no password")));


/*
 * check if user has already been registered
 */	
if (_userExists($email))
{
	exit(json_encode(array("error" => "user exists")));
}
	

/*
 * validate the password, 
 * check if it is at or over the minimum character
 * count and there are no illegal characters
 * 
 * once validated, encode it with a salt
 */

// min password char limit 8
if (strlen($pass) < 8) {
	exit(json_encode(array("error" => "password under minimum length (8 characters)")));
}

$salt = _generateSalt();
$pass = md5( md5($pass) . md5($salt) );


/*
 * determine the current ip address
 * and parse it as an int for storage
 */
$ip = ip2long($_SERVER['REMOTE_ADDR']);



/*
 * add user to database
 */
if (_addUser($email, $username, $password, $salt, $ip))
	exit(json_encode(array("success" => 1, "message" => "user successfully registered")));
else 
	exit(json_encode(array("success" => 0, "message" => "something went wrong, try again soon")));






