<?php
$host = "sql108.infinityfree.com";
$dbname = "if0_41785931_bazos_demo";
$user = "if0_41785931";
$pass = "Heslo123Heslo12";

try {
    // Tady se to spoji. Vytvori se tzv. PDO objekt pres kterej pak budem posilat vsechny dotazy do databaze.
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["success" => false, "message" => "Chyba připojení k databázi: " . $e->getMessage()]));
}
?>