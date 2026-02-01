const http = require('http');

const testLogin = (nombreCompleto, email, password, label) => {
    const data = JSON.stringify({ nombreCompleto, email, password });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            console.log(`Test: ${label}`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Body: ${responseBody}`);
            console.log('---');
        });
    });

    req.on('error', (error) => {
        console.error(`Error in ${label}:`, error.message);
    });

    req.write(data);
    req.end();
};

// 1. Valid Login with all correct fields
testLogin('Fernando Collantes', 'fernandocollantes.24@campuscamara.es', 'G.unit666', 'Valid Login');

// 2. Invalid Name
testLogin('Wrong Name', 'fernandocollantes.24@campuscamara.es', 'G.unit666', 'Invalid Name');

// 3. Invalid Email
testLogin('Fernando Collantes', 'wrong@email.com', 'G.unit666', 'Invalid Email');

// 4. Invalid Password
testLogin('Fernando Collantes', 'fernandocollantes.24@campuscamara.es', 'wrongpass', 'Invalid Password');
