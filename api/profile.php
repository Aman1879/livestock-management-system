<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION["user_id"];

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // Fetch user profile from database
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, full_name, role, phone, profile_image FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Return user data, with empty strings for null values
            echo json_encode([
                'id' => $user['id'],
                'username' => $user['username'] ?? '',
                'email' => $user['email'] ?? '',
                'full_name' => $user['full_name'] ?? '',
                'role' => $user['role'] ?? '',
                'phone' => $user['phone'] ?? '',
                'profile_image' => $user['profile_image'] ?? ''
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Update user profile - preserve existing data for empty fields
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        $pdo = getDBConnection();
        
        // First, fetch current user data to preserve existing values
        $stmt = $pdo->prepare("SELECT full_name, role, email, phone, profile_image FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $current_user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$current_user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        // Merge new data with existing data - only update non-empty fields
        // Email is critical - never allow it to be empty
        $full_name = !empty($data['full_name']) ? trim($data['full_name']) : ($current_user['full_name'] ?? '');
        $role = !empty($data['role']) ? trim($data['role']) : ($current_user['role'] ?? '');
        $email = !empty($data['email']) ? trim($data['email']) : ($current_user['email'] ?? '');
        $phone = !empty($data['phone']) ? trim($data['phone']) : ($current_user['phone'] ?? '');
        $profile_image = !empty($data['profile_image']) ? trim($data['profile_image']) : ($current_user['profile_image'] ?? '');
        
        // Validate email - it must not be empty (required for login)
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email cannot be empty']);
            exit;
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            exit;
        }
        
        // Update database with merged data
        $stmt = $pdo->prepare("UPDATE users SET full_name = ?, role = ?, email = ?, phone = ?, profile_image = ? WHERE id = ?");
        $stmt->execute([
            $full_name,
            $role,
            $email,
            $phone,
            $profile_image,
            $user_id
        ]);

        // Update session data with merged values
        $_SESSION['full_name'] = $full_name;
        $_SESSION['role'] = $role;
        $_SESSION['email'] = $email;
        $_SESSION['phone'] = $phone;
        $_SESSION['profile_image'] = $profile_image;

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
