// Arquivo: app/api/stream/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const mode = searchParams.get('mode'); // 'json', 'redirect', 'preview'
  
  if (!id) {
    return new Response('Erro: ID do arquivo é obrigatório', { status: 400 });
  }

  try {
    console.log(`Processando arquivo: ${id}, modo: ${mode || 'auto'}`);
    
    // Primeiro, tenta download direto (para arquivos pequenos)
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
            'Referer': 'https://drive.google.com/',
          }
        });

        const contentType = response.headers.get('content-type') || '';
        
        // Se conseguiu baixar diretamente (arquivo pequeno)
        if (response.ok && !contentType.includes('text/html')) {
          console.log(`Download direto funcionou: ${url}`);
          
          const headers = new Headers();
          headers.set('Access-Control-Allow-Origin', '*');
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
      } catch (error) {
        console.log(`Falha no download direto com ${url}`);
        continue;
      }
    }

    // Se chegou aqui, é um arquivo grande
    console.log('Arquivo grande detectado - usando estratégias alternativas');

    // Modo preview - redireciona para o Google Drive preview
    if (mode === 'preview' || mode === 'redirect') {
      const previewUrl = `https://drive.google.com/file/d/${id}/preview`;
      return Response.redirect(previewUrl, 302);
    }

    // Modo JSON - retorna informações
    if (mode === 'json') {
      return new Response(
        JSON.stringify({
          fileId: id,
          message: "Arquivo grande - use uma das URLs abaixo:",
          urls: {
            preview: `https://drive.google.com/file/d/${id}/preview`,
            view: `https://drive.google.com/file/d/${id}/view?usp=sharing`,
            download: `https://drive.google.com/uc?export=download&id=${id}`,
          },
          proxy_urls: {
            preview_redirect: `https://meu-proxy-drive.vercel.app/api/stream?id=${id}&mode=preview`,
            iframe_src: `https://drive.google.com/file/d/${id}/preview`,
          }
        }, null, 2), 
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Modo padrão - tenta métodos avançados primeiro, depois fallback
    const confirmUrl = `https://drive.google.com/file/d/${id}/view?usp=sharing`;
    
    try {
      const confirmResponse = await fetch(confirmUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });

      if (confirmResponse.ok) {
        const html = await confirmResponse.text();
        
        // Procura por URLs diretas no HTML
        const patterns = [
          /https:\/\/doc-[0-9a-zA-Z_-]+\.googleusercontent\.com\/docs\/securesc\/[^"'\s]*/g,
          /https:\/\/drive\.google\.com\/uc\?export=download&amp;id=[^"'\s]*&amp;confirm=[^"'\s]*/g,
        ];

        for (const pattern of patterns) {
          const matches = html.match(pattern);
          if (matches && matches[0]) {
            const downloadUrl = matches[0].replace(/&amp;/g, '&');
            
            try {
              const downloadResponse = await fetch(downloadUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Referer': 'https://drive.google.com/',
                }
              });

              const contentType = downloadResponse.headers.get('content-type') || '';
              
              if (downloadResponse.ok && !contentType.includes('text/html')) {
                const headers = new Headers();
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Content-Type', contentType);
                
                const contentLength = downloadResponse.headers.get('content-length');
                if (contentLength) {
                  headers.set('Content-Length', contentLength);
                }
                
                headers.set('Accept-Ranges', 'bytes');
                headers.set('Cache-Control', 'public, max-age=3600');
                
                return new Response(downloadResponse.body, {
                  status: 200,
                  headers: headers,
                });
              }
            } catch (error) {
              console.log('Erro ao tentar URL extraída:', error.message);
            }
          }
        }
      }
    } catch (error) {
      console.log('Erro ao analisar HTML:', error.message);
    }

    // Se nada funcionou, redireciona para preview por padrão
    console.log('Redirecionando para preview como fallback');
    const previewUrl = `https://drive.google.com/file/d/${id}/preview`;
    return Response.redirect(previewUrl, 302);
    
  } catch (error) {
    console.error('Erro geral:', error);
    
    // Em caso de erro, ainda tenta redirecionar para preview
    const previewUrl = `https://drive.google.com/file/d/${id}/preview`;
    return Response.redirect(previewUrl, 302);
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
