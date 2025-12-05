<?php
/**
 * Root index.php - Entry point for the Livestock Management System
 * Redirects to login if not authenticated, otherwise to dashboard
 */

session_start();

// Check if user is logged in
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true && isset($_SESSION["user_id"])) {
    // User is logged in, redirect to dashboard
    header("Location: pages/index.php");
    exit;
} else {
    // User is not logged in, redirect to login page
    header("Location: auth/login.php");
    exit;
}
?>

