"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/navegador";
import s from "./entrar.module.css";

// O Supabase responde em inglês. Traduzir aqui evita jogar "Invalid login
// credentials" na cara de quem só errou a senha.
const TRADUCOES = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail antes de entrar. Veja sua caixa de entrada."],
  [/user already registered/i, "Esse e-mail já tem conta. Tente entrar."],
  [/password should be at least/i, "A senha precisa de pelo menos 6 caracteres."],
  [/unable to validate email/i, "Esse e-mail não parece válido."],
  [/rate limit|too many/i, "Muitas tentativas seguidas. Espere um minuto."],
  [/signups not allowed/i, "Os cadastros estão fechados no momento."],
];

function traduzir(mensagem = "") {
  for (const [padrao, texto] of TRADUCOES) {
    if (padrao.test(mensagem)) return texto;
  }
  return mensagem || "Não consegui completar essa ação.";
}

function Marca() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--orange)" />
      <rect x="7" y="6" width="9" height="16" rx="1.5" fill="#fff" />
      <rect x="17" y="8" width="4.5" height="12" rx="1.5" fill="#fff" opacity="0.55" />
      <path d="M9.5 6h4.5v7l-2.25-1.7L9.5 13V6z" fill="var(--orange)" />
    </svg>
  );
}

export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState("entrar"); // entrar | cadastrar
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const cadastro = modo === "cadastrar";

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setAviso("");

    const supabase = getSupabase();
    if (!supabase) {
      setErro("O login não está configurado neste servidor.");
      return;
    }

    setOcupado(true);
    try {
      if (cadastro) {
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;

        // Com confirmação de e-mail ligada, o Supabase devolve o usuário mas
        // nenhuma sessão. Sem isso o app mandaria pro wizard e a primeira
        // geração falharia com "entre na sua conta".
        if (!data.session) {
          setAviso(
            "Conta criada. Confirme o e-mail que acabamos de enviar e depois volte para entrar."
          );
          setModo("entrar");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }

      // refresh() para os Server Components lerem a sessão nova.
      router.replace("/app");
      router.refresh();
    } catch (falha) {
      setErro(traduzir(falha?.message));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className={s.tela}>
      <div className={`panel ${s.caixa}`}>
        <div className={s.marca}>
          <Marca />
          <span>
            Carrosse<span className={s.marcaLeve}>IA</span>
          </span>
        </div>

        <h1 className={s.titulo}>{cadastro ? "Criar sua conta" : "Entrar"}</h1>
        <p className={s.sub}>
          {cadastro
            ? "Seus carrosséis e seus créditos ficam salvos na conta."
            : "Bem-vindo de volta. Seus projetos estão te esperando."}
        </p>

        <form className={s.form} onSubmit={enviar}>
          <div>
            <label className={`mono-label ${s.rotulo}`} htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              className="field"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label className={`mono-label ${s.rotulo}`} htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              className="field"
              type="password"
              autoComplete={cadastro ? "new-password" : "current-password"}
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={cadastro ? "pelo menos 6 caracteres" : "sua senha"}
            />
          </div>

          <button className={`btn btn-primary ${s.acao}`} type="submit" disabled={ocupado}>
            {ocupado ? "Um instante…" : cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        {erro && <p className={`${s.aviso} ${s.avisoErro}`}>{erro}</p>}
        {aviso && <p className={`${s.aviso} ${s.avisoOk}`}>{aviso}</p>}

        <p className={s.troca}>
          {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
          <button
            type="button"
            className={s.trocaBtn}
            onClick={() => {
              setModo(cadastro ? "entrar" : "cadastrar");
              setErro("");
              setAviso("");
            }}
          >
            {cadastro ? "Entrar" : "Criar agora"}
          </button>
        </p>

        {cadastro && (
          <p className={s.creditosNota}>
            Contas novas começam com 9 créditos. Um roteiro custa 3, uma capa da IA custa 10.
          </p>
        )}
      </div>
    </main>
  );
}
