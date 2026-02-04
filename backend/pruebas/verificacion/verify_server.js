// const http = require('http');

// function test(path) {
//     http.get(`http://localhost:3000${path}`, (res) => {
//         let data = '';
//         res.on('data', chunk => data += chunk);
//         res.on('end', () => {
//             console.log(`Path: ${path}`);
//             console.log(`Status: ${res.statusCode}`);
//             console.log(`Data: ${data.substring(0, 100)}...`);
//         });
//     }).on('error', err => {
//         console.error(`Error on ${path}:`, err.message);
//     });
// }

// test('/api/asignaturas/cursos');
// test('/api/asignaturas');
