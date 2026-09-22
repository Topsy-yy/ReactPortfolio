<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once dirname(__DIR__) . '/vendor/autoload.php';

Dotenv::createImmutable(dirname(__DIR__))->safeLoad();

function environmentValue(string $key, string $default = ''): string
{
    return trim((string) ($_ENV[$key] ?? getenv($key) ?: $default));
}

function respond(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body);
    exit;
}

$allowedOrigin = environmentValue('APP_ALLOWED_ORIGIN');
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedOrigin !== '' && hash_equals($allowedOrigin, $requestOrigin)) {
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false]);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    respond(400, ['success' => false]);
}

$name = trim((string) ($payload['name'] ?? ''));
$email = trim((string) ($payload['email'] ?? ''));
$subject = trim((string) ($payload['custom_subject'] ?? ''));
$message = trim((string) ($payload['message'] ?? ''));
$honeypot = trim((string) ($payload['website'] ?? ''));

if ($honeypot !== '') {
    respond(200, ['success' => true]);
}

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['success' => false]);
}

if (str_word_count($message) < 4 || mb_strlen($name) > 120 || mb_strlen($subject) > 200 || mb_strlen($message) > 10000) {
    respond(422, ['success' => false]);
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = environmentValue('MAIL_HOST');
    $mail->Port = (int) environmentValue('MAIL_PORT', '587');
    $mail->SMTPAuth = true;
    $mail->Username = environmentValue('MAIL_USERNAME');
    $mail->Password = environmentValue('MAIL_PASSWORD');
    $mail->SMTPSecure = strtolower(environmentValue('MAIL_ENCRYPTION', 'tls')) === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom(
        environmentValue('MAIL_FROM_ADDRESS'),
        environmentValue('MAIL_FROM_NAME', 'Portfolio Contact Form')
    );
    $mail->addAddress(
        environmentValue('MAIL_TO_ADDRESS'),
        environmentValue('MAIL_TO_NAME', 'Portfolio Owner')
    );
    $mail->addReplyTo($email, $name);
    $mail->Subject = $subject;
    $mail->isHTML(false);
    $mail->Body = "Name: {$name}\nEmail: {$email}\n\n{$message}";
    $mail->send();

    respond(200, ['success' => true]);
} catch (Exception $exception) {
    error_log('Contact form mail error: ' . $exception->getMessage());
    respond(500, ['success' => false]);
}
