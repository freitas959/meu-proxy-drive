// Arquivo: app/api/stream/route.js

export async function GET(request) {
    // Pega o ID do arquivo da URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Se não tem ID, retorna erro
    if (!id) {
      return new Response('Erro: ID do arquivo é obrigatório', { status: 400 });
    }
  
    try {
      // Monta a URL do Google Drive
      const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      
      // Busca o arquivo no Google Drive
      const response = await fetch(googleDriveUrl);
  
      // Se deu erro, retorna erro
      if (!response.ok) {
        return new Response('Erro: Arquivo não encontrado', { status: 404 });
      }
  
      // Configura os cabeçalhos para funcionar como proxy
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
      
      // Retorna o arquivo
      return new Response(response.body, {
        status: 200,
        headers: headers,
      });
      
    } catch (error) {
      console.log('Erro:', error);
      return new Response('Erro interno', { status: 500 });
    }
  }