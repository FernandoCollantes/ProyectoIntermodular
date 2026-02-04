const asignaturasController = require('../../controllers/asignaturasController');
const asignaturasService = require('../../services/asignaturasService');

// Mock del service
jest.mock('../../services/asignaturasService');

describe('AsignaturasController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            query: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('getAsignaturas', () => {
        test('debe retornar lista de asignaturas exitosamente', async () => {
            // Arrange
            const mockAsignaturas = ['Big Data', 'Videojuegos', 'Acceso a Datos'];
            asignaturasService.getAsignaturas.mockResolvedValue(mockAsignaturas);

            // Act
            await asignaturasController.getAsignaturas(req, res);

            // Assert
            expect(asignaturasService.getAsignaturas).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                subjects: mockAsignaturas
            });
        });

        test('debe manejar errores del servicio', async () => {
            // Arrange
            asignaturasService.getAsignaturas.mockRejectedValue(new Error('Service error'));

            // Act
            await asignaturasController.getAsignaturas(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service error'
            });
        });
    });

    describe('getResultadosAprendizaje', () => {
        test('debe retornar RAs de una asignatura específica', async () => {
            // Arrange
            req.query.asignatura = 'Big Data';
            const mockRAs = [
                { codigo: 'RA1', texto: 'Texto RA1' },
                { codigo: 'RA2', texto: 'Texto RA2' }
            ];
            asignaturasService.getResultadosAprendizaje.mockResolvedValue(mockRAs);

            // Act
            await asignaturasController.getResultadosAprendizaje(req, res);

            // Assert
            expect(asignaturasService.getResultadosAprendizaje).toHaveBeenCalledWith('Big Data');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                results: mockRAs
            });
        });

        test('debe retornar todos los RAs si no se especifica asignatura', async () => {
            // Arrange
            const mockRAs = [
                { codigo: 'RA1', texto: 'Texto RA1', asignatura: 'Big Data' },
                { codigo: 'RA1', texto: 'Texto RA1', asignatura: 'Videojuegos' }
            ];
            asignaturasService.getResultadosAprendizaje.mockResolvedValue(mockRAs);

            // Act
            await asignaturasController.getResultadosAprendizaje(req, res);

            // Assert
            expect(asignaturasService.getResultadosAprendizaje).toHaveBeenCalledWith(undefined);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                results: mockRAs
            });
        });

        test('debe manejar errores del servicio', async () => {
            // Arrange
            req.query.asignatura = 'Big Data';
            asignaturasService.getResultadosAprendizaje.mockRejectedValue(new Error('Service error'));

            // Act
            await asignaturasController.getResultadosAprendizaje(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Service error'
            });
        });
    });
});
