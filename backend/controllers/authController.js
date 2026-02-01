const Profesor = require('../models/Profesor');

exports.login = async (req, res) => {
    try {
        const { nombreCompleto, email, password } = req.body;

        // Buscar al profesor por email
        const profesor = await Profesor.findOne({ email });

        if (!profesor) {
            return res.status(401).json({ message: 'El correo electrónico no está registrado' });
        }

        // Validar nombre completo
        if (profesor.nombre !== nombreCompleto) {
            return res.status(401).json({ message: 'El nombre completo es incorrecto' });
        }

        // Comparación simple de contraseña (sin hash para esta simulación, como se pidió)
        if (profesor.password !== password) {
            return res.status(401).json({ message: 'La contraseña es incorrecta' });
        }

        // Éxito: devolver datos del usuario (sin password)
        const userResponse = {
            id: profesor._id,
            nombre: profesor.nombre,
            email: profesor.email,
            role: 'professor'
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
