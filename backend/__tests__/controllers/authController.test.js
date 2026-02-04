const authController = require('../../controllers/authController');
const Profesor = require('../../models/Profesor');
const { testProfesor, invalidCredentials } = require('../fixtures/test-data');

// Mock del modelo Profesor
jest.mock('../../models/Profesor');

describe('AuthController', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks antes de cada test
        jest.clearAllMocks();

        // Mock de request y response
        req = {
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('login', () => {
        test('debe hacer login exitoso con credenciales válidas', async () => {
            // Arrange
            req.body = {
                nombreCompleto: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            const mockProfesor = {
                _id: 'test-id-123',
                nombre: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            Profesor.findOne.mockResolvedValue(mockProfesor);

            // Act
            await authController.login(req, res);

            // Assert
            expect(Profesor.findOne).toHaveBeenCalledWith({ email: testProfesor.email });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: 'test-id-123',
                nombre: testProfesor.nombre,
                email: testProfesor.email,
                role: 'professor'
            });
        });

        test('debe fallar con email no registrado', async () => {
            // Arrange
            req.body = invalidCredentials.wrongEmail;
            Profesor.findOne.mockResolvedValue(null);

            // Act
            await authController.login(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'El correo electrónico no está registrado'
            });
        });

        test('debe fallar con nombre completo incorrecto', async () => {
            // Arrange
            req.body = invalidCredentials.wrongName;

            const mockProfesor = {
                _id: 'test-id-123',
                nombre: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            Profesor.findOne.mockResolvedValue(mockProfesor);

            // Act
            await authController.login(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'El nombre completo es incorrecto'
            });
        });

        test('debe fallar con contraseña incorrecta', async () => {
            // Arrange
            req.body = invalidCredentials.wrongPassword;

            const mockProfesor = {
                _id: 'test-id-123',
                nombre: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            Profesor.findOne.mockResolvedValue(mockProfesor);

            // Act
            await authController.login(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'La contraseña es incorrecta'
            });
        });

        test('debe manejar errores del servidor', async () => {
            // Arrange
            req.body = {
                nombreCompleto: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            Profesor.findOne.mockRejectedValue(new Error('Database error'));

            // Act
            await authController.login(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error interno del servidor'
            });
        });

        test('no debe incluir la contraseña en la respuesta', async () => {
            // Arrange
            req.body = {
                nombreCompleto: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            const mockProfesor = {
                _id: 'test-id-123',
                nombre: testProfesor.nombre,
                email: testProfesor.email,
                password: testProfesor.password
            };

            Profesor.findOne.mockResolvedValue(mockProfesor);

            // Act
            await authController.login(req, res);

            // Assert
            const responseData = res.json.mock.calls[0][0];
            expect(responseData).not.toHaveProperty('password');
            expect(responseData).toHaveProperty('id');
            expect(responseData).toHaveProperty('nombre');
            expect(responseData).toHaveProperty('email');
            expect(responseData).toHaveProperty('role');
        });
    });
});
