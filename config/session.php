<?php
// session.php
session_start();

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
  header("Location: login.php");
  exit;
}
$username = ucfirst($_SESSION["username"]);
$date = date("l, F j, Y");
$time = date("h:i A");
?>
