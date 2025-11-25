import User from '../models/user.js';

// Popula o banco com usuários iniciais se a coleção estiver vazia
const seedUsers = async () => {
    try {
        console.log('[SEED] Verificando existência de usuários padrão...');

        const count = await User.countDocuments();
        if (count > 0) {
            console.log('[SEED] Usuários já existem.');
            return;
        }

        // Cria administrador e usuário comum
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

        console.log('[SEED] Sucesso: Usuários "admin" e "user" criados.');

    } catch (error) {
        console.error('[SEED] Erro crítico ao criar usuários:', error);
        process.exit(1);
    }
};

export default seedUsers;