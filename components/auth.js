"use client";

// Peças compartilhadas pelas três telas de conta: entrar, esqueci-senha e
// nova-senha. Ficam aqui porque duplicar a tradução de erro em três arquivos é
// como uma mensagem em inglês volta a escapar pro usuário.

/**
 * O Supabase responde em inglês. Traduzir evita jogar "Invalid login
 * credentials" na cara de quem só errou a senha.
 */
const TRADUCOES = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail antes de entrar. Veja sua caixa de entrada."],
  [/user already registered/i, "Esse e-mail já tem conta. Tente entrar."],
  [/password should be at least/i, "A senha precisa de pelo menos 6 caracteres."],
  [/new password should be different/i, "A senha nova precisa ser diferente da anterior."],
  [/unable to validate email/i, "Esse e-mail não parece válido."],
  [/rate limit|too many/i, "Muitas tentativas seguidas. Espere um minuto."],
  [/signups not allowed/i, "Os cadastros estão fechados no momento."],
  // O Supabase varia bastante a frase conforme o fluxo: "Email link is invalid
  // or has expired", "Token has expired or is invalid", "otp_expired". Para o
  // usuário é tudo a mesma coisa — o link não serve mais.
  [
    /link is invalid|has expired|expired.*invalid|invalid.*token|token.*invalid|otp.?expired|code verifier|auth code|flow state/i,
    "Esse link de recuperação já venceu ou já foi usado. Peça um novo.",
  ],
  [/same password/i, "Escolha uma senha diferente da atual."],
  [/failed to fetch|network|load failed/i, "Sem conexão com o servidor. Tente de novo."],
];

export function traduzir(mensagem = "") {
  for (const [padrao, texto] of TRADUCOES) {
    if (padrao.test(mensagem)) return texto;
  }
  return mensagem || "Não consegui completar essa ação.";
}

export function Marca() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--orange)" />
      <rect x="7" y="6" width="9" height="16" rx="1.5" fill="#fff" />
      <rect x="17" y="8" width="4.5" height="12" rx="1.5" fill="#fff" opacity="0.55" />
      <path d="M9.5 6h4.5v7l-2.25-1.7L9.5 13V6z" fill="var(--orange)" />
    </svg>
  );
}

export function IconeOlho({ aberto }) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.7 10S4.6 4.8 10 4.8 18.3 10 18.3 10 15.4 15.2 10 15.2 1.7 10 1.7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      {/* A barra cortando é o estado "escondida": some quando a senha aparece. */}
      {!aberto && (
        <path d="M3.5 3.5l13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

/**
 * Campo de senha com o olho de revelar. As três telas usam o mesmo, e a de
 * nova senha usa dois.
 */
export function CampoSenha({ s, id, rotulo, valor, aoMudar, autoComplete, placeholder }) {
  return (
    <div>
      <label className={`mono-label ${s.rotulo}`} htmlFor={id}>
        {rotulo}
      </label>
      <div className={s.campoSenha}>
        <input
          id={id}
          className={`field ${s.entradaSenha}`}
          type={valor.visivel ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={6}
          value={valor.texto}
          onChange={(e) => aoMudar({ ...valor, texto: e.target.value })}
          placeholder={placeholder}
        />
        <button
          type="button"
          className={s.olho}
          onClick={() => aoMudar({ ...valor, visivel: !valor.visivel })}
          aria-label={valor.visivel ? "Esconder senha" : "Mostrar senha"}
          aria-pressed={valor.visivel}
          title={valor.visivel ? "Esconder senha" : "Mostrar senha"}
        >
          <IconeOlho aberto={valor.visivel} />
        </button>
      </div>
    </div>
  );
}
