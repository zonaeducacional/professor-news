import Parser from 'rss-parser';
import fs from 'fs';

// Inicializa o leitor de RSS
const parser = new Parser();
const FEED_URL = 'http://agenciabrasil.ebc.com.br/rss/educacao/feed.xml';

async function coletarNoticias() {
  console.log('📰 Iniciando coleta de notícias da Agência Brasil...');

  try {
    // 1. Baixa e lê o XML da Agência Brasil
    const feed = await parser.parseURL(FEED_URL);
    
    // 2. Seleciona e limpa os dados que nos interessam
    const noticiasLimpas = feed.items.map(item => {
      // Tenta achar uma imagem no conteúdo da notícia
      // O regex procura por tags <img src="...">
      const imgMatch = item.content ? item.content.match(/src="([^"]+)"/) : null;
      const imagemUrl = imgMatch ? imgMatch[1] : null;

      return {
        id: item.guid || item.link,
        titulo: item.title,
        link: item.link,
        data: item.isoDate, // Data em formato padrão ISO
        resumo: item.contentSnippet ? item.contentSnippet.substring(0, 150) + '...' : '',
        imagem: imagemUrl,
        lido: false // Começa como não lido
      };
    });

    // 3. Salva o resultado na pasta 'public' para o app acessar
    // Se a pasta public não existir, o script cria (embora no Vite ela já exista)
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public');
    }

    fs.writeFileSync('./public/noticias.json', JSON.stringify(noticiasLimpas, null, 2));
    
    console.log(`✅ Sucesso! ${noticiasLimpas.length} notícias foram salvas em public/noticias.json`);

  } catch (erro) {
    console.error('❌ Erro na coleta:', erro);
  }
}

coletarNoticias();