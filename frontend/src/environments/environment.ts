// // Función para detectar automáticamente la URL del backend según desde dónde se acceda
// const getApiUrl = () => {
//     const host = window.location.hostname;

//     // 1. Si estamos en localhost, usamos el puerto 3000 habitual
//     if (host === 'localhost' || host === '127.0.0.1') {
//         return 'http://localhost:3000/api';
//     }

//     // 2. Si es un túnel de VS Code (ej: lzqn1fzl-4200.uks1.devtunnels.ms)
//     // Cambiamos el puerto -4200 por -3000 en el nombre del subdominio
//     if (host.includes('devtunnels.ms')) {
//         const apiHost = host.replace('-4200', '-3000');
//         return `https://${apiHost}/api`;
//     }

//     // 3. Si estamos en una IP local (ej: 192.168.1.45)
//     return `http://${host}:3000/api`;
// };

// export const environment = {
//     production: false,
//     apiUrl: getApiUrl()
// };
// Función para detectar automáticamente la URL del backend
const getApiUrl = () => {
    const host = window.location.hostname;
    const port = window.location.port;

    // --- NUEVA LÓGICA PARA EL DESPLIEGUE (VM) ---
    // Si estamos accediendo por el puerto 8080 (que es nuestro Nginx),
    // usamos una ruta relativa. Nginx redirigirá internamente al backend.
    if (port === '8080' || port === '80') {
        return '/api';
    }
    // --------------------------------------------

    // 1. Si estamos en localhost (desarrollo local normal en puerto 4200)
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }

    // 2. Si es un túnel de VS Code
    if (host.includes('devtunnels.ms')) {
        const apiHost = host.replace('-4200', '-3000');
        return `https://${apiHost}/api`;
    }

    // 3. Fallback para otras IPs
    return `http://${host}:3000/api`;
};

export const environment = {
    production: true,  // Lo ponemos en true porque vamos a construir para producción
    apiUrl: getApiUrl()
};