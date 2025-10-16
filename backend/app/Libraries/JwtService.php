<?php
namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secret;
    private string $algo = 'HS256';
    private int $leeway = 60; // segundos de tolerancia 

    public function __construct()
    {
        // Lee JWT_SECRET desde .env
        $this->secret = getenv('JWT_SECRET') ?: 'changeme';

        if ($this->leeway > 0) {
            JWT::$leeway = $this->leeway;
        }
    }

    /**
     * Crea un token JWT.
     * @param array $payload  Claims personalizados
     * @param int   $ttlSeconds  Tiempo de vida (segundos)
     */
    public function create(array $payload, int $ttlSeconds = 3600): string
    {
        $now = time();

        $claims = array_merge([
            'iat' => $now,                
            'nbf' => $now,                 
            'exp' => $now + $ttlSeconds,   
            'iss' => base_url(),           
        ], $payload);

        return JWT::encode($claims, $this->secret, $this->algo);
    }

    /**
     * Verifica/decodifica un token.
     * @return array|null  Payload decodificado o null si inválido/expirado.
     */
    public function verify(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algo));
            return (array) $decoded;
        } catch (\Throwable $e) {
            log_message('warning', 'JWT inválido: ' . $e->getMessage());
            return null;
        }
    }
}
