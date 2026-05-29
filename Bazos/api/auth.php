<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

// Zjistim, co po mne ten JavaScript chce
$action = $_GET['action'] ?? '';

if ($action === 'login') {
    // Vytahnu si email a heslo, co mi JS poslal
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Mrknu do databaze, jestli tam je
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $_SESSION['user'] = ["name" => $user['name'], "email" => $user['email']];
        echo json_encode(["success" => true, "user" => $_SESSION['user']]);
    } else {
        echo json_encode(["success" => false, "message" => "Špatný e-mail nebo heslo"]);
    }
} 
elseif ($action === 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "E-mail již existuje"]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        if ($stmt->execute([$name, $email, $password])) {
            $_SESSION['user'] = ["name" => $name, "email" => $email];
            echo json_encode(["success" => true, "user" => $_SESSION['user']]);
        } else {
            echo json_encode(["success" => false, "message" => "Chyba při registraci"]);
        }
    }
}
elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(["success" => true]);
}
elseif ($action === 'me') {
    if (isset($_SESSION['user'])) {
        echo json_encode(["success" => true, "user" => $_SESSION['user']]);
    } else {
        echo json_encode(["success" => false, "user" => null]);
    }
}
?>
