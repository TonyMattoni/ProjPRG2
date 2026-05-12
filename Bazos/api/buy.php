<?php
require_once 'db.php';
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user'])) {
    echo json_encode(["success" => false, "message" => "Pro nákup se musíte přihlásit."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['ad_id'])) {
        echo json_encode(["success" => false, "message" => "Chybí ID inzerátu."]);
        exit;
    }

    $ad_id = (int) $data['ad_id'];
    $buyer_email = $_SESSION['user']['email'];

    // Zjistit informace o inzerátu (autor, cena)
    $stmt = $pdo->prepare("SELECT author, price, title FROM ads WHERE id = ?");
    $stmt->execute([$ad_id]);
    $ad = $stmt->fetch();

    if (!$ad) {
        echo json_encode(["success" => false, "message" => "Inzerát nebyl nalezen."]);
        exit;
    }

    if ($ad['author'] === $buyer_email) {
        echo json_encode(["success" => false, "message" => "Nemůžete koupit vlastní inzerát."]);
        exit;
    }

    $seller_email = $ad['author'];
    $price = $ad['price'];

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO sales (ad_id, buyer_email, seller_email, price) VALUES (?, ?, ?, ?)");
        $stmt->execute([$ad_id, $buyer_email, $seller_email, $price]);

        // Smazat inzerát po zakoupení, aby zmizel
        $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ?");
        $stmt->execute([$ad_id]);

        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Úspěšně zakoupeno!"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Chyba databáze: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Neplatná metoda."]);
}
?>