import User from '../models/user.js';

// Função para popular o banco de dados com usuários iniciais.
const seedUsers = async () => {
    try {
        // Verifica se já existem usuários cadastrados.
        const count = await User.countDocuments();
        // Se houver, interrompe a execução para não duplicar os dados.
        if (count > 0) {
            return;
        }

        // Cria um usuário padrão com perfil de administrador.
        await User.create({
            username: 'admin',
            password: 'admin',
            role: 'admin'
        });

        // Cria um usuário padrão com perfil de usuário comum.
        await User.create({
            username: 'user',
            password: 'user',
            role: 'user'
        });

        console.log('Usuários padrão (admin, user) criados com sucesso.');

    } catch (error) {
        // Em caso de erro, exibe a falha no console e encerra a aplicação.
        console.error('Erro ao criar usuários padrão:', error);
        process.exit(1);
    }
};

export default seedUsers;