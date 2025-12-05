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
            $stmt = $pdo->prepare("SELECT * FROM feeding_records WHERE user_id = ? ORDER BY date DESC");
            $stmt->execute([$user_id]);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($records);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO feeding_records (user_id, date, feed_type, animals, quantity, cost) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $user_id,
                $data['date'],
                $data['feed_type'],
                $data['animals'],
                $data['quantity'],
                $data['cost']
            ]);
            
            // Log activity
            $activity_stmt = $pdo->prepare("INSERT INTO activities (user_id, activity_type, description) VALUES (?, ?, ?)");
            $activity_stmt->execute([
                $user_id,
                'feeding_logged',
                "Logged feeding: {$data['feed_type']} for {$data['animals']} (₹{$data['cost']})"
            ]);
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>