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
    // Primeira tentativa: URL direta com confirm
    let downloadUrl = `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
    
    let response = await fetch(downloadUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://drive.google.com/',
        'Accept': '*/*',
      }
    });

    // Se ainda redirecionou para página de confirmação, tenta método alternativo
    if (response.url.includes('drive.google.com') && response.headers.get('content-type')?.includes('text/html')) {
      // Método alternativo para arquivos grandes
      downloadUrl = `https://docs.google.com/uc?export=download&id=${id}&confirm=t`;
      
      response = await fetch(downloadUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://drive.google.com/',
          'Accept': '*/*',
        }
      });
    }

    // Se ainda não conseguiu, tenta buscar o link direto no HTML
    if (response.headers.get('content-type')?.includes('text/html')) {
      const html = await response.text();
      
      // Procura pelo link de download direto no HTML
      const downloadMatch = html.match(/https:\/\/doc-[^"]*googleusercontent\.com[^"]*/);
      
      if (downloadMatch) {
        response = await fetch(downloadMatch[0], {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
      }
    }

    // Se ainda não conseguiu o arquivo direto, retorna erro
    if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
      return new Response('Erro: Não foi possível acessar o arquivo diretamente. Verifique se o arquivo está público.', { status: 404 });
    }

    // Configura os cabeçalhos para funcionar como proxy
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    
    // Adiciona headers para melhor compatibilidade
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    // Headers para streaming de vídeo
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Content-Disposition', 'inline');
    
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
