<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    // GET /api/parents.php?username=...
    $username = $_GET['username'] ?? '';
    if (!$username) { sendJson(['error' => 'missing username']); exit; }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $u = $stmt->fetch();
    if (!$u) { sendJson([]); exit; }
    $uid = (int)$u['id'];
    $stmt = $pdo->prepare('SELECT id, name, relation, child_id FROM parents WHERE user_id = ?');
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    sendJson($rows);
    exit;
}

if ($method === 'POST') {
    $input = getJsonInput();
    if (!$input) { sendJson(['error' => 'invalid']); exit; }
    $username = $input['username'] ?? '';
    $name = trim($input['name'] ?? '');
    $relation = trim($input['relation'] ?? '');
    $childId = $input['childId'] ?? null;
    $id = $input['id'] ?? null;
    if (!$username || !$name || !$relation || !$childId) { sendJson(['error' => 'missing']); exit; }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $u = $stmt->fetch();
    if (!$u) { sendJson(['error' => 'user not found']); exit; }
    $uid = (int)$u['id'];
    if ($id) {
        $pdo->prepare('UPDATE parents SET name = ?, relation = ?, child_id = ? WHERE id = ? AND user_id = ?')->execute([$name, $relation, $childId, $id, $uid]);
        sendJson(['ok' => true]);
    } else {
        $pdo->prepare('INSERT INTO parents (user_id, name, relation, child_id) VALUES (?, ?, ?, ?)')->execute([$uid, $name, $relation, $childId]);
        sendJson(['ok' => true]);
    }
    exit;
}

if ($method === 'OPTIONS') { header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); exit; }

http_response_code(405);
sendJson(['error' => 'method not allowed']);

?>