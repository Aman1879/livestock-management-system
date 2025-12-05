<?php
session_start();
require_once '../config/database.php';

// Ensure the user is authenticated
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
            // Fetch all health records for this user
            $stmt = $pdo->prepare("
                SELECT hr.*, a.animal_type, a.breed 
                FROM health_records hr 
                JOIN animals a ON hr.animal_id = a.id 
                WHERE hr.user_id = ? 
                ORDER BY hr.date DESC
            ");
            $stmt->execute([$user_id]);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($records);
            break;

        case 'POST':
            // Read and validate input
            $data = json_decode(file_get_contents('php://input'), true);

            $requiredFields = ['animal_id', 'date', 'type', 'details', 'status'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing required field: $field"]);
                    exit;
                }
            }

            // Insert health record
            $stmt = $pdo->prepare("
                INSERT INTO health_records (user_id, animal_id, date, type, details, status) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user_id,
                $data['animal_id'],
                $data['date'],
                $data['type'],
                $data['details'],
                $data['status']
            ]);

            // Log the activity
            $activity_stmt = $pdo->prepare("
                INSERT INTO activities (user_id, activity_type, description) 
                VALUES (?, ?, ?)
            ");
            $activity_stmt->execute([
                $user_id,
                'health_record',
                "Added {$data['type']} record: {$data['details']}"
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
