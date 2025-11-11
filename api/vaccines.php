<?php
require_once __DIR__ . '/db.php';

$stmt = $pdo->query('SELECT code, name, age FROM vaccines ORDER BY code');
$rows = $stmt->fetchAll();
sendJson($rows);

?>