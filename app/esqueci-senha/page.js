"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/navegador";
import { traduzir, Marca } from "@/components/auth";
// Mesma casca visual da tela de entrar; duplicar 130 linhas de CSS pra repetir
// o mesmo cartão seria pior.
import s from "../entrar/entrar.module.css";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");

    const supabase = getSupabase();
    if (!supabase) {
      setErro("O login não está configurado neste servidor.");
      return;
    }

    setOcupado(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // A origem sai da própria janela: assim funciona em localhost e em
        // produção sem variável de ambiente nova. O endereço precisa estar na
        // lista de Redirect URLs do painel do Supabase.
        redirectTo: `${window.location.origin}/nova-senha`,
      });
      if (error) throw error;
      setEnviado(true);
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

        <h1 className={s.titulo}>Recuperar senha</h1>

        {enviado ? (
          <>
            <p className={s.sub}>
              Se existir uma conta com esse e-mail, o link de recuperação já está a caminho.
              Ele vale por uma hora e só pode ser usado uma vez.
            </p>
            <p className={`${s.aviso} ${s.avisoOk}`}>
              Não achou? Veja o spam. O remetente é o do Supabase até você configurar um
              e-mail próprio.
            </p>
          </>
        ) : (
          <>
            <p className={s.sub}>
              Escreva o e-mail da conta. Mandamos um link para você criar uma senha nova.
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

              <button className={`btn btn-primary ${s.acao}`} type="submit" disabled={ocupado}>
                {ocupado ? "Enviando…" : "Enviar link"}
              </button>
            </form>

            {erro && <p className={`${s.aviso} ${s.avisoErro}`}>{erro}</p>}
          </>
        )}

        <p className={s.troca}>
          <Link className={s.trocaBtn} href="/entrar">
            Voltar para entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
