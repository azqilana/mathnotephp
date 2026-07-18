<?php
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$dataFile = __DIR__ . '/../data/notes.json';
if(!file_exists($dataFile)){
    file_put_contents($dataFile, json_encode([]));
}

function readNotes($file){
    $s = file_get_contents($file);
    $arr = json_decode($s, true);
    return is_array($arr) ? $arr : [];
}

function writeNotes($file, $arr){
    file_put_contents($file, json_encode(array_values($arr), JSON_PRETTY_PRINT));
}

if($method === 'GET'){
    $notes = readNotes($dataFile);
    echo json_encode($notes);
    exit;
}

if($method === 'POST'){
    $body = json_decode(file_get_contents('php://input'), true);
    if(!$body || !isset($body['title']) || !isset($body['content'])){
        http_response_code(400);
        echo json_encode(['error'=>'invalid payload']);
        exit;
    }
    $notes = readNotes($dataFile);
    $id = round(microtime(true)*1000);
    $notes[] = ['id'=>$id,'title'=>$body['title'],'content'=>$body['content']];
    writeNotes($dataFile, $notes);
    echo json_encode(['ok'=>true,'id'=>$id]);
    exit;
}

if($method === 'DELETE'){
    parse_str($_SERVER['QUERY_STRING'], $qs);
    if(!isset($qs['id'])){
        http_response_code(400);
        echo json_encode(['error'=>'missing id']);
        exit;
    }
    $id = $qs['id'];
    $notes = readNotes($dataFile);
    $notes = array_filter($notes, fn($n)=>strval($n['id']) !== strval($id));
    writeNotes($dataFile, $notes);
    echo json_encode(['ok'=>true]);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'method not allowed']);
