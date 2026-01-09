import Dexie from 'dexie';

export const db = new Dexie('ProfessorNewsDB');

// Aqui definimos as "tabelas" do banco
// ++id: cria um número automático (1, 2, 3...)
// guid: é o RG da notícia (para não repetirmos a mesma notícia)
// lido, favorito: para marcarmos o status
db.version(1).stores({
  noticias: '++id, guid, data, lido, favorito' 
});