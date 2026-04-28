<?php
$host = "localhost";
$dbname = "bazos_demo";
$user = "root";
$pass = ""; // Výchozí heslo v XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["success" => false, "message" => "Chyba připojení k databázi: " . $e->getMessage()]));
}
?>
