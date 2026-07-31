"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/navegador";
import { traduzir, Marca, CampoSenha } from "@/components/auth";
import s from "../entrar/entrar.module.css";

/**
 * Lê os parâmetros da URL vindos do link do e-mail.
 *
 * O Supabase manda de três jeitos, conforme a versão e o modelo de e-mail
 * configurados: `?code=` no fluxo PKCE, `?token_hash=&type=` no modelo novo, e
 * `#access_token=` no fluxo antigo. Tratamos os três porque quem escolhe é o
 * painel, não o código — e trocar o modelo de e-mail lá não pode quebrar aqui.
 */
function lerLink() {
  if (typeof window === "undefined") return {};
  const busca = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const de = (chave) => busca.get(chave) || hash.get(chave) || "";
  return {
    codigo: de("code"),
    tokenHash: de("token_hash"),
    tipo: de("type"),
    erro: de("error_description") || de("error"),
  };
}

/** Tira o token da barra de endereço: recarregar ou voltar não pode reenviá-lo. */
function limparUrl() {
  window.history.replaceState({}, "", window.location.pathname);
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export default function NovaSenha() {
  const router = useRouter();
  const [estado, setEstado] = useState("verificando"); // verificando | pronto | invalido | salvo
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState({ texto: "", visivel: false });
  const [confirma, setConfirma] = useState({ texto: "", visivel: false });
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let vivo = true;

    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setEstado("invalido");
        setErro("O login não está configurado neste servidor.");
        return;
      }

      const { codigo, tokenHash, tipo, erro: erroNoLink } = lerLink();
      if (erroNoLink) {
        limparUrl();
        if (!vivo) return;
        setEstado("invalido");
        setErro(traduzir(erroNoLink));
        return;
      }

      // O cliente do navegador já troca o `code` sozinho ao subir
      // (detectSessionInUrl). Esperamos essa troca antes de tentar na mão:
      // trocar duas vezes queima o code verifier e derruba um link que estava
      // perfeitamente válido.
      for (let tentativa = 0; tentativa < 8; tentativa++) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          limparUrl();
          if (!vivo) return;
          setEstado("pronto");
          return;
        }
        if (!codigo) break;
        await espera(150);
      }

      try {
        if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: tipo || "recovery",
          });
          if (error) throw error;
        } else if (codigo) {
          const { error } = await supabase.auth.exchangeCodeForSession(codigo);
          if (error) throw error;
        } else {
          throw new Error("sem token");
        }
        limparUrl();
        if (!vivo) return;
        setEstado("pronto");
      } catch (falha) {
        limparUrl();
        if (!vivo) return;
        setEstado("invalido");
        setErro(
          falha?.message === "sem token"
            ? "Abra esta página pelo link que enviamos por e-mail."
            : traduzir(falha?.message)
        );
      }
    })();

    return () => {
      vivo = false;
    };
  }, []);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");

    if (senha.texto !== confirma.texto) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setOcupado(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: senha.texto });
      if (error) throw error;
      setEstado("salvo");
      // Um instante pra pessoa ler a confirmação antes de trocar de tela.
      setTimeout(() => {
        router.replace("/app");
        router.refresh();
      }, 1200);
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

        <h1 className={s.titulo}>Nova senha</h1>

        {estado === "verificando" && <p className={s.sub}>Conferindo o link…</p>}

        {estado === "invalido" && (
          <>
            <p className={s.sub}>Não consegui validar esse link.</p>
            {erro && <p className={`${s.aviso} ${s.avisoErro}`}>{erro}</p>}
            <p className={s.troca}>
              <Link className={s.trocaBtn} href="/esqueci-senha">
                Pedir um link novo
              </Link>
            </p>
          </>
        )}

        {estado === "salvo" && (
          <>
            <p className={s.sub}>Senha trocada.</p>
            <p className={`${s.aviso} ${s.avisoOk}`}>Levando você para o app…</p>
          </>
        )}

        {estado === "pronto" && (
          <>
            <p className={s.sub}>Escolha a senha nova. Você já entra direto com ela.</p>

            <form className={s.form} onSubmit={salvar}>
              <CampoSenha
                s={s}
                id="senha"
                rotulo="Nova senha"
                valor={senha}
                aoMudar={setSenha}
                autoComplete="new-password"
                placeholder="pelo menos 6 caracteres"
              />
              <CampoSenha
                s={s}
                id="confirma"
                rotulo="Repita a senha"
                valor={confirma}
                aoMudar={setConfirma}
                autoComplete="new-password"
                placeholder="a mesma de cima"
              />

              <button className={`btn btn-primary ${s.acao}`} type="submit" disabled={ocupado}>
                {ocupado ? "Salvando…" : "Salvar senha"}
              </button>
            </form>

            {erro && <p className={`${s.aviso} ${s.avisoErro}`}>{erro}</p>}
          </>
        )}
      </div>
    </main>
  );
}
