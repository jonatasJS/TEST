import bcrypt from 'bcryptjs';
import { db, pool } from './index';
import { users, products } from './schema';

async function seed() {
  console.log('Iniciando o seeding do banco de dados...');

  try {
    // 1. Limpar tabelas existentes (opcional, mas bom para garantir integridade)
    console.log('Limpando tabelas antigas...');
    // Devido às chaves estrangeiras, a ordem de limpeza importa se estivéssemos limpando tudo, mas como é um banco limpo, apenas inserimos ou ignoramos duplicados.

    // 2. Cadastrar Usuários de Teste (Admin e Cliente)
    console.log('Criando usuários admin@cybervapes.com e client@gmail.com...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('adminpassword123', salt);
    const clientPasswordHash = await bcrypt.hash('clientpassword123', salt);

    // Inserir Admin
    await db.insert(users).values({
      name: 'Administrador CyberVapes',
      email: 'admin@cybervapes.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    }).onConflictDoNothing();

    // Inserir Cliente
    await db.insert(users).values({
      name: 'Lucas Souza Cliente',
      email: 'client@gmail.com',
      passwordHash: clientPasswordHash,
      role: 'client',
    }).onConflictDoNothing();

    // 3. Cadastrar Produtos Mock Premium
    console.log('Inserindo produtos vapes simulados...');
    const vapeProducts = [
      {
        name: 'Ignite V50 Descartável',
        description: 'O Pod descartável Ignite V50 apresenta tecnologia de ponta, entregando cerca de 5000 puffs de puro sabor e fluxo de ar constante. Perfeito para uso diário.',
        price: 89.90,
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1527137341206-1aa2539bbff6?q=80&w=400&auto=format&fit=crop',
        category: 'disposable',
        puffs: 5000,
        nicotine: '5%',
        flavor: 'Watermelon Ice',
        isActive: true,
      },
      {
        name: 'Oxbar G8000 Descartável',
        description: 'Visual moderno de acrílico translúcido com cordão de pescoço incluso. São 8000 puxadas com bobina de mesh duplo que ressalta o adocicado e o frescor.',
        price: 99.90,
        stock: 24,
        imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?q=80&w=400&auto=format&fit=crop',
        category: 'disposable',
        puffs: 8000,
        nicotine: '5%',
        flavor: 'Blue Razz Ice',
        isActive: true,
      },
      {
        name: 'Uwell Caliburn G3 Pod System',
        description: 'Dispositivo recarregável de alta performance para quem busca a melhor experiência MTL/RDL. Bateria de 900mAh integrada e cartuchos com tecnologia Pro-FOCS.',
        price: 199.90,
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
        category: 'pod_system',
        puffs: null,
        nicotine: '0 - 50mg',
        flavor: 'Silver Metallic',
        isActive: true,
      },
      {
        name: 'Elf Bar BC5000 Descartável',
        description: 'O clássico mais vendido do mercado mundial. Formato retangular super ergonômico, bateria recarregável USB-C e muito sabor.',
        price: 79.90,
        stock: 0, // Estoque esgotado para testar visualizador no frontend
        imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop',
        category: 'disposable',
        puffs: 5000,
        nicotine: '5%',
        flavor: 'Strawberry Kiwi',
        isActive: true,
      },
      {
        name: 'Nasty Juice Cush Man Mango',
        description: 'Um dos e-liquids mais aclamados do mundo vape. Sabor da mais pura manga fresca com um toque suave de mentol refrescante na exalação.',
        price: 69.90,
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=400&auto=format&fit=crop',
        category: 'juice',
        puffs: null,
        nicotine: '3mg',
        flavor: 'Mango Strawberry',
        isActive: true,
      },
      {
        name: 'Vaporesso XROS 4 Mini',
        description: 'O XROS 4 Mini apresenta uma bateria de 1000mAh e carregamento rápido de 1A, com design de liga de alumínio luxuoso e controle de fluxo de ar preciso.',
        price: 189.90,
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=400&auto=format&fit=crop',
        category: 'pod_system',
        puffs: null,
        nicotine: '0 - 35mg',
        flavor: 'Neon Pink',
        isActive: true,
      }
    ];

    for (const prod of vapeProducts) {
      await db.insert(products).values(prod);
    }

    console.log('Seeding concluído com extremo sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await pool.end();
    console.log('Conexão com o pool de banco de dados encerrada.');
  }
}

seed();
