<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(["success" => false, "favorites" => []]);
    exit;
}

$email = $_SESSION['user']['email'];
$action = $_SERVER['REQUEST_METHOD'];

if ($action === 'GET') {
    $stmt = $pdo->prepare("SELECT ad_id FROM favorites WHERE user_email = ?");
    $stmt->execute([$email]);
    $favs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $favs = array_map('intval', $favs);
    echo json_encode(["success" => true, "favorites" => $favs]);
}
elseif ($action === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $ad_id = $data['ad_id'];

    $stmt = $pdo->prepare("SELECT * FROM favorites WHERE user_email = ? AND ad_id = ?");
    $stmt->execute([$email, $ad_id]);
    
    if ($stmt->fetch()) {
        $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_email = ? AND ad_id = ?");
        $stmt->execute([$email, $ad_id]);
        echo json_encode(["success" => true, "status" => "removed"]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO favorites (user_email, ad_id) VALUES (?, ?)");
        $stmt->execute([$email, $ad_id]);
        echo json_encode(["success" => true, "status" => "added"]);
    }
}
?>
