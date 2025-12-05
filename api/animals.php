<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION["user_id"];
$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();
    
    switch ($method) {
        case 'GET':
            // Get all animals for the user
            $stmt = $pdo->prepare("SELECT * FROM animals WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user_id]);
            $animals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($animals);
            break;
            
        case 'POST':
            // Add new animal
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO animals (user_id, animal_type, breed, age, status, image) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $user_id,
                $data['type'],
                $data['breed'],
                $data['age'],
                $data['status'],
                $data['image'] ?: 'wh.jpg'
            ]);
            
            // Log activity
            $activity_stmt = $pdo->prepare("INSERT INTO activities (user_id, activity_type, description) VALUES (?, ?, ?)");
            $activity_stmt->execute([
                $user_id,
                'animal_added',
                "Added new {$data['type']} ({$data['breed']}) to inventory"
            ]);
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            // Update animal
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("UPDATE animals SET animal_type = ?, breed = ?, age = ?, status = ?, image = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([
                $data['type'],
                $data['breed'],
                $data['age'],
                $data['status'],
                $data['image'] ?: 'wh.jpg',
                $data['id'],
                $user_id
            ]);
            
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            // Delete animal
            $animal_id = $_GET['id'];
            
            $stmt = $pdo->prepare("DELETE FROM animals WHERE id = ? AND user_id = ?");
            $stmt->execute([$animal_id, $user_id]);
            
            echo json_encode(['success' => true]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>