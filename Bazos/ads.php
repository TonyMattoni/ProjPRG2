<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$action = $_SERVER['REQUEST_METHOD'];

if ($action === 'GET') {
    $stmt = $pdo->query("SELECT * FROM ads ORDER BY created_at DESC");
    $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($ads as &$ad) {
        $ad['id'] = (int)$ad['id'];
        $ad['price'] = (int)$ad['price'];
    }
    echo json_encode($ads);
}
elseif ($action === 'POST') {
    if (!isset($_SESSION['user'])) {
        echo json_encode(["success" => false, "message" => "Nejste přihlášeni"]);
        exit;
    }
    
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (!$data && isset($_POST['title'])) {
        $data = $_POST;
    }
    
    if(isset($data['action']) && $data['action'] === 'delete') {
        $id = $data['id'];
        $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ? AND author = ?");
        if ($stmt->execute([$id, $_SESSION['user']['email']])) {
            $stmt2 = $pdo->prepare("DELETE FROM favorites WHERE ad_id = ?");
            $stmt2->execute([$id]);
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false]);
        }
        exit;
    }
    
    if (isset($data['title'])) {
        $title = $data['title'];
        $desc = $data['desc'];
        $price = $data['price'];
        $category = $data['category'];
        $location = $data['location'];
        $author = $_SESSION['user']['email'];
        $image = "";

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '.' . $ext;
            $targetPath = $uploadDir . $filename;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $image = 'uploads/' . $filename;
            }
        }

        $stmt = $pdo->prepare("INSERT INTO ads (title, `desc`, price, category, location, author, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$title, $desc, $price, $category, $location, $author, $image])) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false]);
        }
    }
}
?>
