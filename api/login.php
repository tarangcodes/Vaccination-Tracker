<?php
require_once __DIR__ . '/db.php';

$input = getJsonInput();
if (!$input) { sendJson(['error' => 'invalid input']); exit; }
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
if (!$username || !$password) { sendJson(['error' => 'missing']); exit; }

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
    sendJson(['error' => 'invalid']);
    exit;
}

sendJson(['ok' => true, 'user' => ['id' => (int)$user['id'], 'username' => $username]]);

?>