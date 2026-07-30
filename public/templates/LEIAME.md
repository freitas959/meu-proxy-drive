# Capas dos templates

As imagens de capa dos templates do código moram aqui, com o **id do template**
no nome do arquivo:

```
insider.webp
advocacia.webp
nutricionista.webp
```

O caminho entra no campo `capaUrl` de `lib/templates.js`, como `/templates/insider.webp`.

Quando `capaUrl` está vazio, o card de capa cai no fundo abstrato gerado a
partir da paleta — nada quebra, só fica menos bonito.

Os prompts para gerar cada uma estão em `docs/capas-dos-templates.md`.

Capa definida no estúdio é outra coisa: aquela vai para o bucket `templates`
do Supabase e vence a que está aqui.
