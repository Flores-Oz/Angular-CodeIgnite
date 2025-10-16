<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class RoleFilter implements FilterInterface
{
    /**
     * Do whatever processing this filter needs to do.
     * By default it should not return anything during
     * normal execution. However, when an abnormal state
     * is found, it should return an instance of
     * CodeIgniter\HTTP\Response. If it does, script
     * execution will end and that Response will be
     * sent back to the client, allowing for error pages,
     * redirects, etc.
     *
     * @param RequestInterface $request
     * @param array|null       $arguments
     *
     * @return RequestInterface|ResponseInterface|string|void
     */
    public function before(RequestInterface $request, $arguments = null)
    {
          // Roles esperados en la definición de la ruta
        $expected = $args ?? [];

        // Payload JWT establecido en JwtFilter
        $user = $request->user ?? null;

        // No autenticado
        if (!$user) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['message' => 'Unauthorized: no token or invalid token']);
        }

        // Roles del usuario
        $roles = $user->roles ?? [];

        // Asegurar que sea array (por si acaso)
        if (!is_array($roles)) {
            $roles = [$roles];
        }

        // Comparación (case-insensitive opcional)
        $roles = array_map('strtolower', $roles);
        $expected = array_map('strtolower', $expected);

        // Verificar coincidencia
        foreach ($expected as $role) {
            if (in_array($role, $roles)) {
                return; // autorizado
            }
        }

        // no tiene el rol necesario
        return service('response')
            ->setStatusCode(403)
            ->setJSON(['message' => 'Forbidden: insufficient role']);
    }

    /**
     * Allows After filters to inspect and modify the response
     * object as needed. This method does not allow any way
     * to stop execution of other after filters, short of
     * throwing an Exception or Error.
     *
     * @param RequestInterface  $request
     * @param ResponseInterface $response
     * @param array|null        $arguments
     *
     * @return ResponseInterface|void
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        //
    }
}
