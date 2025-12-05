<?php
session_start();
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    if (empty($email) || empty($password)) {
        $error = "Please fill in all fields";
    } else {
        try {
            $pdo = getDBConnection();
            $stmt = $pdo->prepare("SELECT id, username, password, full_name, email, role, phone, profile_image FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['loggedin'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['full_name'] = $user['full_name'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['phone'] = $user['phone'];
                $_SESSION['profile_image'] = $user['profile_image'];
                
                header("Location: ../pages/index.php");
                exit;
            } else {
                $error = "Invalid email or password";
            }
        } catch (PDOException $e) {
            $error = "Database error: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body class="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
    <video autoplay muted loop id="bg-video" class="absolute w-full h-full object-cover -z-10">
        <source src="../assets/videos/v2.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>

    <div id="login-box" class="hidden w-full max-w-md bg-gradient-to-br from-blue-200 to-blue-700 p-8 rounded shadow-lg backdrop-blur-md z-10 text-white">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

        <?php if (!empty($_SESSION["success"])): ?>
            <div class="bg-blue-100 text-blue-800 p-2 rounded mb-4">
                <?= $_SESSION["success"]; unset($_SESSION["success"]); ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($error)): ?>
            <div class="bg-red-100 text-red-800 p-2 rounded mb-4"><?= $error; ?></div>
        <?php endif; ?>

        <form method="POST" id="login-form">
            <input type="email" name="email" placeholder="Email" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <input type="password" name="password" placeholder="Password" class="w-full p-2 mb-4 rounded text-gray-800" required>
            <button type="submit" class="w-full bg-white text-green-700 font-bold p-2 rounded hover:bg-gray-100 transition">Login</button>
        </form>

        <p class="mt-4 text-center text-sm text-white">
            Don't have an account? <a href="register.php" class="underline text-white">Register</a>
        </p>
    </div>

    <script>
        $(document).ready(function () {
            $("#login-box").slideDown(800);
            $("#login-form").on("submit", function () {
                $("#login-box").slideUp(400);
            });
        });
    </script>
</body>
</html>
