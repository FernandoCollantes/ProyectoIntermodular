const asignaturasService = require('../../services/asignaturasService');
const ResultadoAprendizajeModel = require('../../models/ResultadoAprendizaje');
const { testAsignatura, testRA } = require('../fixtures/test-data');

// Mock del modelo
jest.mock('../../models/ResultadoAprendizaje');

describe('AsignaturasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAsignaturas', () => {
        test('debe retornar lista de asignaturas únicas ordenadas', async () => {
            // Arrange
            const mockAsignaturas = ['Videojuegos', 'Big Data', 'Acceso a Datos'];
            ResultadoAprendizajeModel.distinct.mockResolvedValue(mockAsignaturas);

            // Act
            const result = await asignaturasService.getAsignaturas();

            // Assert
            expect(ResultadoAprendizajeModel.distinct).toHaveBeenCalledWith('asignatura');
            expect(result).toEqual(['Acceso a Datos', 'Big Data', 'Videojuegos']);
            expect(result).toHaveLength(3);
        });

        test('debe retornar array vacío si no hay asignaturas', async () => {
            // Arrange
            ResultadoAprendizajeModel.distinct.mockResolvedValue([]);

            // Act
            const result = await asignaturasService.getAsignaturas();

            // Assert
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test('debe lanzar error si falla la consulta', async () => {
            // Arrange
            ResultadoAprendizajeModel.distinct.mockRejectedValue(new Error('DB Error'));

            // Act & Assert
            await expect(asignaturasService.getAsignaturas())
                .rejects
                .toThrow('Error al obtener asignaturas: DB Error');
        });
    });

    describe('getResultadosAprendizaje', () => {
        test('debe retornar RAs filtrados por asignatura', async () => {
            // Arrange
            const mockRAs = [
                { codigo: 'RA1', texto: 'Texto RA1', asignatura: 'Big Data' },
                { codigo: 'RA2', texto: 'Texto RA2', asignatura: 'Big Data' }
            ];

            const mockQuery = {
                sort: jest.fn().mockResolvedValue(mockRAs)
            };

            ResultadoAprendizajeModel.find.mockReturnValue(mockQuery);

            // Act
            const result = await asignaturasService.getResultadosAprendizaje('Big Data');

            // Assert
            expect(ResultadoAprendizajeModel.find).toHaveBeenCalledWith({ asignatura: 'Big Data' });
            expect(mockQuery.sort).toHaveBeenCalledWith({ codigo: 1 });
            expect(result).toEqual(mockRAs);
            expect(result).toHaveLength(2);
        });

        test('debe retornar todos los RAs si no se especifica asignatura', async () => {
            // Arrange
            const mockRAs = [
                { codigo: 'RA1', texto: 'Texto RA1', asignatura: 'Big Data' },
                { codigo: 'RA1', texto: 'Texto RA1', asignatura: 'Videojuegos' }
            ];

            const mockQuery = {
                sort: jest.fn().mockResolvedValue(mockRAs)
            };

            ResultadoAprendizajeModel.find.mockReturnValue(mockQuery);

            // Act
            const result = await asignaturasService.getResultadosAprendizaje();

            // Assert
            expect(ResultadoAprendizajeModel.find).toHaveBeenCalledWith({});
            expect(result).toHaveLength(2);
        });

        test('debe ordenar RAs por código', async () => {
            // Arrange
            const mockQuery = {
                sort: jest.fn().mockResolvedValue([])
            };

            ResultadoAprendizajeModel.find.mockReturnValue(mockQuery);

            // Act
            await asignaturasService.getResultadosAprendizaje('Big Data');

            // Assert
            expect(mockQuery.sort).toHaveBeenCalledWith({ codigo: 1 });
        });

        test('debe lanzar error si falla la consulta', async () => {
            // Arrange
            ResultadoAprendizajeModel.find.mockImplementation(() => {
                throw new Error('DB Error');
            });

            // Act & Assert
            await expect(asignaturasService.getResultadosAprendizaje('Big Data'))
                .rejects
                .toThrow('Error al obtener RAs: DB Error');
        });
    });

    describe('createResultadoAprendizaje', () => {
        test('debe crear un nuevo RA correctamente', async () => {
            // Arrange
            const mockSave = jest.fn().mockResolvedValue({
                _id: 'test-id',
                codigo: testRA.codigo,
                texto: testRA.texto,
                asignatura: testRA.asignatura
            });

            ResultadoAprendizajeModel.mockImplementation(() => ({
                save: mockSave
            }));

            // Act
            const result = await asignaturasService.createResultadoAprendizaje(
                testRA.codigo,
                testRA.texto,
                testRA.asignatura
            );

            // Assert
            expect(ResultadoAprendizajeModel).toHaveBeenCalledWith({
                codigo: testRA.codigo,
                texto: testRA.texto,
                asignatura: testRA.asignatura
            });
            expect(mockSave).toHaveBeenCalled();
            expect(result).toHaveProperty('_id');
            expect(result.codigo).toBe(testRA.codigo);
        });
    });

    describe('getCursos (obsoleto)', () => {
        test('debe retornar array vacío', async () => {
            // Act
            const result = await asignaturasService.getCursos();

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getCriterios (obsoleto)', () => {
        test('debe retornar array vacío', async () => {
            // Act
            const result = await asignaturasService.getCriterios();

            // Assert
            expect(result).toEqual([]);
        });
    });
});
