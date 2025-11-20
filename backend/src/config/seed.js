import User from '../models/user.js';

// Verifica e popula o banco com usuários padrão caso não existam
const seedUsers = async () => {
    try {
        // Consulta se já há documentos para evitar duplicação
        const count = await User.countDocuments();
        if (count > 0) {
            return;
        }

        // Insere usuários iniciais (admin e user) no banco
        await User.create({
            username: 'admin',
            password: 'admin',
            role: 'admin'
        });

        await User.create({
            username: 'user',
            password: 'user',
            role: 'user'
        });

        console.log('Usuários padrão (admin, user) criados com sucesso.');

    } catch (error) {
        console.error('Erro ao criar usuários padrão:', error);
        process.exit(1);
    }
};

export default seedUsers;