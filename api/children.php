<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    // GET /api/children.php?username=...
    $username = $_GET['username'] ?? '';
    if (!$username) { sendJson(['error' => 'missing username']); exit; }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $u = $stmt->fetch();
    if (!$u) { sendJson([]); exit; }
    $uid = (int)$u['id'];
    $stmt = $pdo->prepare('SELECT id, name, dob, gender, blood_group, doses FROM children WHERE user_id = ?');
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    // decode doses
    foreach ($rows as &$r) {
        $r['doses'] = $r['doses'] ? json_decode($r['doses'], true) : new stdClass();
    }
    sendJson($rows);
    exit;
}

if ($method === 'POST') {
    $input = getJsonInput();
    if (!$input) { sendJson(['error' => 'invalid']); exit; }
    $username = $input['username'] ?? '';
    $name = trim($input['name'] ?? '');
    $dob = $input['dob'] ?? '';
    $gender = $input['gender'] ?? null;
    $blood_group = $input['blood_group'] ?? null;
    $doses = $input['doses'] ?? null;
    $id = $input['id'] ?? null;
    if (!$username || !$name || !$dob) { sendJson(['error' => 'missing']); exit; }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $u = $stmt->fetch();
    if (!$u) { sendJson(['error' => 'user not found']); exit; }
    $uid = (int)$u['id'];
    if ($id) {
        // update
        $sql = 'UPDATE children SET name = ?, dob = ?, gender = ?, blood_group = ?, doses = ? WHERE id = ? AND user_id = ?';
        $pdo->prepare($sql)->execute([$name, $dob, $gender, $blood_group, $doses ? json_encode($doses) : null, $id, $uid]);
        sendJson(['ok' => true]);
    } else {
        // insert using MySQL UUID()
        $sql = 'INSERT INTO children (id, user_id, name, dob, gender, blood_group, doses) VALUES (UUID(), ?, ?, ?, ?, ?, ?)';
        $pdo->prepare($sql)->execute([$uid, $name, $dob, $gender, $blood_group, $doses ? json_encode($doses) : null]);
        // fetch the created row (by last insert id isn't available for UUID()); select by matching name+user+dob as quick approach
        $stmt = $pdo->prepare('SELECT id, name, dob, gender, blood_group, doses FROM children WHERE user_id = ? AND name = ? AND dob = ? ORDER BY created_at DESC LIMIT 1');
        $stmt->execute([$uid, $name, $dob]);
        $row = $stmt->fetch();
        if ($row) { $row['doses'] = $row['doses'] ? json_decode($row['doses'], true) : new stdClass(); }
        sendJson($row ?: ['ok' => true]);
    }
    exit;
}

if ($method === 'OPTIONS') { header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); exit; }

http_response_code(405);
sendJson(['error' => 'method not allowed']);

?>