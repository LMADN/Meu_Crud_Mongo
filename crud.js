const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(url);
const dbName = 'usuarios_db'; 
const collectionName = 'usuarios';

async function main() {
    try {
        await client.connect();
        console.log("Conectado ao servidor MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Cria um novo item
        await createItem(collection, 'item1', 100, 'Descri��o do item 1');

        // mostra todos os itens
        await listAllItems(collection);

        // Atualizar o item
        await updateItem(collection, 'item1', { value: 150, description: 'Descri��o atualizada do item 1' });

        // mostra todos os itens ap�s a atualiza��o
        await listAllItems(collection);

        // Excluir o item
        await deleteItem(collection, 'item1');

        // mostra todos os itens ap�s a exclus�o
        await listAllItems(collection);
    } catch (error) {
        console.error("Erro no fluxo principal:", error);
    } finally {
        await client.close();
        console.log("Conex�o com o MongoDB fechada.");
    }
}

async function createItem(collection, name, value, description) {
    try {
        // mostra a valida��o de entrada
        if (!name || !value || !description) {
            throw new Error("Todos os campos (name, value, description) s�o obrigat�rios.");
        }

        const newItem = { name, value, description, date: new Date() };
        const result = await collection.insertOne(newItem);
        console.log("Novo item inserido com o id:", result.insertedId);
    } catch (error) {
        console.error("Erro ao criar item:", error.message);
    }
}

async function findItems(collection, filter) {
    try {
        const items = await collection.find(filter).toArray();
        console.log("Itens encontrados:", items);
    } catch (error) {
        console.error("Erro ao encontrar itens:", error.message);
    }
}

async function listAllItems(collection) {
    try {
        const items = await collection.find().toArray();
        console.log("Todos os itens na cole��o:", items);
    } catch (error) {
        console.error("Erro ao listar itens:", error.message);
    }
}

async function updateItem(collection, name, updatedData) {
    try {
        // mostra a valida��o de entrada
        if (!name || Object.keys(updatedData).length === 0) {
            throw new Error("Nome do item e dados atualizados s�o obrigat�rios.");
        }

        const result = await collection.updateOne(
            { name: name },
            { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
            console.log(`Item "${name}" atualizado com sucesso!`);
        } else {
            console.log(`Nenhum item encontrado para atualizar: "${name}"`);
        }
    } catch (error) {
        console.error("Erro ao atualizar item:", error.message);
    }
}

async function deleteItem(collection, name) {
    try {
        if (!name) {
            throw new Error("O nome do item � obrigat�rio para exclus�o.");
        }

        const result = await collection.deleteOne({ name: name });
        if (result.deletedCount > 0) {
            console.log(`Item "${name}" exclu�do com sucesso!`);
        } else {
            console.log(`Nenhum item encontrado para excluir: "${name}"`);
        }
    } catch (error) {
        console.error("Erro ao excluir item:", error.message);
    }
}

// retorna ao inicio da fun��o principal do codigo
main().catch(console.error);