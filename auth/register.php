<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$errors = [];
$success = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $full_name = trim($_POST['full_name']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Validation
    if (empty($username) || empty($email) || empty($full_name) || empty($password) || empty($confirm_password)) {
        $errors[] = "All fields are required.";
    } elseif ($password !== $confirm_password) {
        $errors[] = "Passwords do not match.";
    } elseif (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters.";
    } else {
        try {
            $pdo = getDBConnection();

            // Check for existing username/email
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);

            if ($stmt->rowCount() > 0) {
                $errors[] = "Username or email already exists.";
            } else {
                // Insert new user
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, email, full_name, password) VALUES (?, ?, ?, ?)");
                $stmt->execute([$username, $email, $full_name, $hashed_password]);

                $success = "Registration successful! Please <a href='login.php' class='underline'>login</a>.";
            }
        } catch (PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body class="relative min-h-screen flex items-center justify-center overflow-hidden">

    <!-- Background Video -->
    <video autoplay muted loop id="bg-video" class="absolute w-full h-full object-cover -z-10">
        <source src="../assets/videos/v3.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>

    <!-- Register Form -->
    <div id="register-box" class="hidden w-full max-w-md bg-gradient-to-br from-green-400 to-green-700 p-8 rounded shadow-lg backdrop-blur-md z-10 text-white">
        <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>

        <?php if (!empty($errors)): ?>
            <div class="bg-red-100 text-red-800 p-2 rounded mb-4">
                <?php foreach ($errors as $e): ?>
                    <p><?= htmlspecialchars($e) ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($success)): ?>
            <div class="bg-green-100 text-green-800 p-2 rounded mb-4"><?= $success; ?></div>
        <?php endif; ?>

        <form method="POST" id="register-form">
            <input type="text" name="username" placeholder="Username" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <input type="email" name="email" placeholder="Email" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <input type="text" name="full_name" placeholder="Full Name" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <input type="password" name="password" placeholder="Password" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <button type="submit" class="w-full bg-white text-green-700 font-bold p-2 rounded hover:bg-gray-100 transition">Register</button>
        </form>

        <p class="mt-4 text-center text-sm text-white">
            Already have an account? <a href="login.php" class="underline text-white">Login</a>
        </p>
    </div>

    <script>
        $(document).ready(function () {
            $("#register-box").slideDown(800);
        });
    </script>
</body>
</html>
