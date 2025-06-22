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
    // Múltiplas URLs para tentar
    const urls = [
      `https://drive.google.com/uc?export=download&id=${id}&confirm=t`,
      `https://docs.google.com/uc?export=download&id=${id}&confirm=t`,
      `https://drive.google.com/u/0/uc?id=${id}&export=download&confirm=t`,
      `https://drive.google.com/file/d/${id}/view?usp=sharing`,
    ];

    let finalResponse = null;
    let finalUrl = null;

    for (const url of urls) {
      try {
        console.log(`Tentando URL: ${url}`);
        
        const response = await fetch(url, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://drive.google.com/',
          }
        });

        console.log(`Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

        // Se não é HTML, provavelmente é o arquivo
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && response.ok) {
          finalResponse = response;
          finalUrl = url;
          console.log(`Sucesso com URL: ${url}`);
          break;
        }

        // Se é HTML, tenta extrair link direto
        if (contentType.includes('text/html') && response.ok) {
          const html = await response.text();
          
          // Procura por diferentes padrões de download
          const patterns = [
            /https:\/\/doc-[^"'\s]*\.googleusercontent\.com[^"'\s]*/g,
            /https:\/\/drive\.google\.com\/uc\?export=download[^"'\s]*/g,
            /https:\/\/docs\.google\.com\/uc\?export=download[^"'\s]*/g,
          ];

          for (const pattern of patterns) {
            const matches = html.match(pattern);
            if (matches && matches[0]) {
              console.log(`Link direto encontrado: ${matches[0]}`);
              
              const directResponse = await fetch(matches[0], {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Referer': 'https://drive.google.com/',
                }
              });

              if (directResponse.ok && !directResponse.headers.get('content-type')?.includes('text/html')) {
                finalResponse = directResponse;
                finalUrl = matches[0];
                break;
              }
            }
          }
          
          if (finalResponse) break;
        }

      } catch (error) {
        console.log(`Erro com URL ${url}:`, error.message);
        continue;
      }
    }

    // Se nenhuma URL funcionou, retorna erro
    if (!finalResponse || !finalResponse.ok) {
      return new Response('Erro: Arquivo não acessível. Verifique se está público e tente novamente.', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Se ainda retornou HTML, força download anyway
    const contentType = finalResponse.headers.get('content-type') || 'application/octet-stream';
    if (contentType.includes('text/html')) {
      // Força como vídeo se o ID parece ser de vídeo
      const forceContentType = 'video/mp4';
      
      const headers = new Headers();
      headers.set('Content-Type', forceContentType);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Disposition', 'inline');
      headers.set('Cache-Control', 'public, max-age=3600');
      
      return new Response(finalResponse.body, {
        status: 200,
        headers: headers,
      });
    }

    // Configura headers para o arquivo encontrado
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', contentType);
    
    const contentLength = finalResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Content-Disposition', 'inline');
    
    console.log(`Retornando arquivo. Tipo: ${contentType}, Tamanho: ${contentLength || 'desconhecido'}`);
    
    return new Response(finalResponse.body, {
      status: 200,
      headers: headers,
    });
    
  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(`Erro interno: ${error.message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
