// Arquivo: app/api/stream/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return new Response('Erro: ID do arquivo é obrigatório', { status: 400 });
  }

  try {
    // Para arquivos grandes, vamos tentar uma abordagem diferente
    console.log(`Processando arquivo grande: ${id}`);
    
    // Primeira tentativa: obter página de confirmação
    const confirmUrl = `https://drive.google.com/file/d/${id}/view?usp=sharing`;
    
    const confirmResponse = await fetch(confirmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (confirmResponse.ok) {
      const html = await confirmResponse.text();
      
      // Procura por diferentes padrões de URLs de download para arquivos grandes
      const patterns = [
        // Padrão 1: URL direta do googleusercontent
        /https:\/\/doc-[0-9a-zA-Z_-]+\.googleusercontent\.com\/docs\/securesc\/[^"'\s]*/g,
        
        // Padrão 2: URL de export com token
        /https:\/\/drive\.google\.com\/uc\?export=download&amp;id=[^"'\s]*&amp;confirm=[^"'\s]*/g,
        
        // Padrão 3: URL alternativa
        /https:\/\/docs\.google\.com\/uc\?export=download&amp;id=[^"'\s]*&amp;confirm=[^"'\s]*/g,
        
        // Padrão 4: URLs com authuser
        /https:\/\/drive\.google\.com\/u\/0\/uc\?id=[^"'\s]*&amp;export=download[^"'\s]*/g,
      ];

      let downloadUrl = null;
      
      for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches && matches[0]) {
          downloadUrl = matches[0]
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '')
            .replace(/'/g, '')
            .replace(/"/g, '');
          console.log(`URL encontrada com padrão: ${downloadUrl}`);
          break;
        }
      }

      // Se não encontrou URL no HTML, tenta extrair token de confirmação
      if (!downloadUrl) {
        const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatch) {
          const confirmToken = confirmMatch[1];
          downloadUrl = `https://drive.google.com/uc?export=download&id=${id}&confirm=${confirmToken}`;
          console.log(`URL com token de confirmação: ${downloadUrl}`);
        }
      }

      // Se ainda não tem URL, tenta padrões alternativos
      if (!downloadUrl) {
        // Procura por UUID que às vezes aparece
        const uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
        if (uuidMatch) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${id}&confirm=${uuidMatch[0]}`;
          console.log(`URL com UUID: ${downloadUrl}`);
        }
      }

      // Tenta fazer download com a URL encontrada
      if (downloadUrl) {
        const downloadResponse = await fetch(downloadUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity',
            'Referer': 'https://drive.google.com/',
            'Origin': 'https://drive.google.com',
          }
        });

        const contentType = downloadResponse.headers.get('content-type') || '';
        console.log(`Resposta do download: ${downloadResponse.status}, Content-Type: ${contentType}`);

        // Se não é HTML, provavelmente conseguiu o arquivo
        if (downloadResponse.ok && !contentType.includes('text/html')) {
          const headers = new Headers();
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
          headers.set('Content-Type', contentType);
          
          // Suporte a Range requests para streaming
          const range = request.headers.get('range');
          const contentLength = downloadResponse.headers.get('content-length');
          
          if (range && contentLength) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength) - 1;
            
            headers.set('Content-Range', `bytes ${start}-${end}/${contentLength}`);
            headers.set('Accept-Ranges', 'bytes');
            headers.set('Content-Length', (end - start + 1).toString());
            
            return new Response(downloadResponse.body, {
              status: 206, // Partial Content
              headers: headers,
            });
          } else {
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
        }
      }
    }

    // Se chegou até aqui, não conseguiu download direto
    // Retorna uma resposta com método alternativo para arquivos grandes
    return new Response(
      JSON.stringify({
        error: "Arquivo muito grande para download direto via proxy",
        fileId: id,
        message: "Para arquivos grandes (>25MB), use um dos métodos abaixo:",
        methods: {
          direct: `https://drive.google.com/file/d/${id}/view?usp=sharing`,
          download: `https://drive.google.com/uc?export=download&id=${id}`,
          streaming: `https://drive.google.com/file/d/${id}/preview`,
        },
        instructions: [
          "1. Use um gerenciador de download (IDM, wget, etc.)",
          "2. Ou integre com um player que suporte URLs do Google Drive",
          "3. Ou configure autenticação OAuth para acesso direto",
          "4. Para streaming: use a URL 'preview' em um iframe"
        ],
        note: "O Google Drive limita downloads diretos de arquivos grandes via API para prevenir abuso."
      }, null, 2), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
    
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        fileId: id,
        suggestion: `Para arquivos grandes, tente: https://drive.google.com/file/d/${id}/view`
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Suporte a Range requests
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
