"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/navegador";
import { traduzir, Marca, IconeOlho } from "@/components/auth";
import s from "./entrar.module.css";

export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState("entrar"); // entrar | cadastrar
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

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
            Carross<span className={s.marcaLeve}>ê</span>
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
            <div className={s.campoSenha}>
              <input
                id="senha"
                className={`field ${s.entradaSenha}`}
                type={senhaVisivel ? "text" : "password"}
                autoComplete={cadastro ? "new-password" : "current-password"}
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={cadastro ? "pelo menos 6 caracteres" : "sua senha"}
              />
              <button
                type="button"
                className={s.olho}
                onClick={() => setSenhaVisivel((v) => !v)}
                aria-label={senhaVisivel ? "Esconder senha" : "Mostrar senha"}
                aria-pressed={senhaVisivel}
                title={senhaVisivel ? "Esconder senha" : "Mostrar senha"}
              >
                <IconeOlho aberto={senhaVisivel} />
              </button>
            </div>
          </div>

          <button className={`btn btn-primary ${s.acao}`} type="submit" disabled={ocupado}>
            {ocupado ? "Um instante…" : cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>

        {/* Só no modo entrar: no cadastro não existe senha pra recuperar. */}
        {!cadastro && (
          <p className={s.troca}>
            <Link className={s.trocaBtn} href="/esqueci-senha">
              Esqueci minha senha
            </Link>
          </p>
        )}

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
            <br />
            Ao criar a conta você concorda com os{" "}
            <Link href="/termos">Termos de Uso</Link> e a{" "}
            <Link href="/privacidade">Política de Privacidade</Link>.
          </p>
        )}
      </div>
    </main>
  );
}
