<?php
header('Content-Type: application/json');
require 'db.php';

$stmt = $pdo->query("SELECT category, COUNT(*) as count FROM ads GROUP BY category");
$counts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

echo json_encode(["success" => true, "counts" => $counts]);
?>
