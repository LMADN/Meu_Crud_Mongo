const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

const app = express();
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'usuarios'; 
const collectionName = 'itens';

app.use(express.json());
app.use(express.static('public'));

// Configuração do logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console() // Logging no console
    ],
});

// Conectar ao MongoDB
async function connectDB() {
    try {
        await client.connect();
        logger.info("Conectado ao servidor MongoDB");
        return client.db(dbName).collection(collectionName);
    } catch (error) {
        logger.error("Erro ao conectar ao MongoDB:", error);
        throw error;
    }
}

// Criar um item
app.post('/api/itens', [
    body('name').notEmpty().withMessage('O nome é obrigatório.'),
    body('value').isNumeric().withMessage('O valor deve ser um número.'),
    body('description').optional().isString().withMessage('A descrição deve ser uma string.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const collection = await connectDB();
    const { name, value, description } = req.body;
    const newItem = { name, value, description, date: new Date() };

    try {
        const result = await collection.insertOne(newItem);
        logger.info("Novo item inserido com o id:", result.insertedId);
        res.status(201).json({ id: result.insertedId });
    } catch (error) {
        logger.error("Erro ao inserir item:", error);
        res.status(500).send('Erro ao inserir o item.');
    }
});

// Listar todos os itens
app.get('/api/itens', async (req, res) => {
    const collection = await connectDB();

    try {
        const items = await collection.find().toArray();
        logger.info("Itens encontrados:", items);
        res.status(200).json(items);
    } catch (error) {
        logger.error("Erro ao buscar itens:", error);
        res.status(500).send('Erro ao buscar itens.');
    }
});

// Atualizar um item
app.put('/api/itens/:id', [
    body('value').isNumeric().withMessage('O valor deve ser um número'),
    body('description').optional().isString().withMessage('A descrição deve ser uma string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const collection = await connectDB();
    try {
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).send('Item não encontrado.');
        }
        logger.info("Item atualizado com sucesso.");
        res.status(200).send('Item atualizado com sucesso.');
    } catch (error) {
        logger.error("Erro ao atualizar item:", error);
        res.status(500).send('Erro ao atualizar o item.');
    }
});

// Excluir um item
app.delete('/api/itens/:id', async (req, res) => {
    const { id } = req.params;

    const collection = await connectDB();
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send('Item não encontrado.');
        }
        logger.info("Item excluído com sucesso.");
        res.status(200).send('Item excluído com sucesso.');
    } catch (error) {
        logger.error("Erro ao excluir item:", error);
        res.status(500).send('Erro ao excluir o item.');
    }
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
});
