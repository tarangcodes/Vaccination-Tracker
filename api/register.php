<?php
require_once __DIR__ . '/db.php';

$input = getJsonInput();
if (!$input) { sendJson(['error' => 'invalid input']); exit; }
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
if (!$username || !$password) { sendJson(['error' => 'missing']); exit; }

// check exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) { sendJson(['error' => 'exists']); exit; }

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
$stmt->execute([$username, $hash]);
$id = $pdo->lastInsertId();
sendJson(['ok' => true, 'user' => ['id' => (int)$id, 'username' => $username]]);

?>