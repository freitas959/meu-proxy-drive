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
    // Primeiro, vamos tentar a abordagem mais simples que às vezes funciona
    const directUrls = [
      `https://drive.google.com/uc?export=download&id=${id}`,
      `https://docs.google.com/uc?export=download&id=${id}`,
    ];

    for (const url of directUrls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive',
            'Referer': 'https://drive.google.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
          }
        });

        // Se retornou um arquivo válido (não HTML)
        const contentType = response.headers.get('content-type') || '';
        
        if (response.ok && !contentType.includes('text/html')) {
          console.log(`Sucesso direto com: ${url}`);
          
          const headers = new Headers();
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Range');
          headers.set('Content-Type', contentType);
          
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            headers.set('Content-Length', contentLength);
          }
          
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=86400');
          
          return new Response(response.body, {
            status: 200,
            headers: headers,
          });
        }

        // Se retornou HTML, tenta extrair o link real
        if (response.ok && contentType.includes('text/html')) {
          const html = await response.text();
          
          // Procura pelo link de download real
          const downloadLinkMatch = html.match(/https:\/\/doc-[0-9a-zA-Z_-]*\.googleusercontent\.com\/docs\/securesc\/[^"']*/);
          
          if (downloadLinkMatch) {
            console.log(`Link direto encontrado: ${downloadLinkMatch[0]}`);
            
            const directResponse = await fetch(downloadLinkMatch[0], {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://drive.google.com/',
                'Accept': '*/*',
              }
            });

            if (directResponse.ok) {
              const headers = new Headers();
              headers.set('Access-Control-Allow-Origin', '*');
              headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
              headers.set('Access-Control-Allow-Headers', 'Range');
              headers.set('Content-Type', directResponse.headers.get('content-type') || 'application/octet-stream');
              
              const contentLength = directResponse.headers.get('content-length');
              if (contentLength) {
                headers.set('Content-Length', contentLength);
              }
              
              headers.set('Accept-Ranges', 'bytes');
              headers.set('Cache-Control', 'public, max-age=86400');
              
              return new Response(directResponse.body, {
                status: 200,
                headers: headers,
              });
            }
          }
        }
      } catch (error) {
        console.log(`Falha com ${url}:`, error.message);
        continue;
      }
    }

    // Se chegou até aqui, tenta método de fallback - retorna a URL do Google Drive para o cliente resolver
    return new Response(
      JSON.stringify({
        error: "Não foi possível fazer download direto",
        message: "Use este link no navegador:",
        directLink: `https://drive.google.com/file/d/${id}/view?usp=sharing`,
        downloadLink: `https://drive.google.com/uc?export=download&id=${id}`,
        instructions: "1. Abra o link no navegador 2. Clique em download 3. Ou use um gerenciador de download"
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
    
  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        id: id,
        suggestion: `Tente acessar diretamente: https://drive.google.com/file/d/${id}/view`
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Adiciona suporte a OPTIONS para CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
