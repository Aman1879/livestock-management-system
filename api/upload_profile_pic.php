<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION["user_id"];

// Check if file was uploaded
if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error occurred']);
    exit;
}

$file = $_FILES['profile_picture'];

// Validate file type - only allow images
$allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$file_type = $file['type'];
$file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($file_type, $allowed_types) || !in_array($file_extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Only image files are allowed (JPG, JPEG, PNG, GIF, WEBP)']);
    exit;
}

// Validate file size (max 5MB)
$max_size = 5 * 1024 * 1024; // 5MB in bytes
if ($file['size'] > $max_size) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds maximum allowed size of 5MB']);
    exit;
}

// Create uploads directory if it doesn't exist
$upload_dir = __DIR__ . '/../assets/images/uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generate unique filename to prevent conflicts
$file_name = 'profile_' . $user_id . '_' . time() . '_' . uniqid() . '.' . $file_extension;
$upload_path = $upload_dir . $file_name;

// Move uploaded file to destination
if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file']);
    exit;
}

// Get web-accessible path for database storage (relative to root)
$web_path = 'assets/images/uploads/' . $file_name;
$relative_path = '../assets/images/uploads/' . $file_name;

// Update user profile image in database
try {
    $pdo = getDBConnection();
    
    // Get old profile image path to delete it later
    $stmt = $pdo->prepare("SELECT profile_image FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $old_image = $stmt->fetchColumn();
    
    // Update database with new image path (use web path)
    $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->execute([$web_path, $user_id]);
    
    // Delete old profile image if it exists and is in uploads folder
    if ($old_image && strpos($old_image, 'uploads/') !== false) {
        $old_file_path = __DIR__ . '/../' . $old_image;
        if (file_exists($old_file_path)) {
            @unlink($old_file_path);
        }
    }
    
    // Update session
    $_SESSION['profile_image'] = $web_path;
    
    echo json_encode([
        'success' => true,
        'image_path' => '../' . $web_path, // Return path relative to pages/ directory
        'message' => 'Profile picture uploaded successfully'
    ]);
} catch (PDOException $e) {
    // Delete uploaded file if database update fails
    @unlink($upload_path);
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>

