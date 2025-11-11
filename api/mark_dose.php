<?php
require_once __DIR__ . '/db.php';
$input = getJsonInput();
if (!$input) { sendJson(['error' => 'invalid']); exit; }
$childId = $input['child_id'] ?? null;
$code = $input['code'] ?? null;
if (!$childId || !$code) { sendJson(['error' => 'missing']); exit; }

// find child
$stmt = $pdo->prepare('SELECT doses FROM children WHERE id = ?');
$stmt->execute([$childId]);
$c = $stmt->fetch();
if (!$c) { sendJson(['error' => 'child not found']); exit; }
$doses = $c['doses'] ? json_decode($c['doses'], true) : [];
if (empty($doses[$code])) {
    $doses[$code] = date('Y-m-d');
    $pdo->prepare('UPDATE children SET doses = ? WHERE id = ?')->execute([json_encode($doses), $childId]);
}
sendJson(['ok' => true, 'doses' => $doses]);

?>