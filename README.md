# Sentinelas da Verdade - App de Gestão

Este é o aplicativo oficial do Clube de Desbravadores **Sentinelas da Verdade**.

## 🚀 Como hospedar na Vercel (Recomendado)

A Vercel é mais rápida e fácil para apps React. Siga estes passos:

1.  Acesse [vercel.com](https://vercel.com) e crie uma conta (pode usar seu GitHub).
2.  Clique em **"Add New"** > **"Project"**.
3.  Importe o seu repositório `sentinelas-da-verdade`.
4.  Em **Build & Development Settings**, a Vercel detectará automaticamente as configurações. 
5.  Clique em **"Deploy"**.

<<<<<<< HEAD
## 📦 Como resolver o erro de "Push" no VS Code

Se aparecer um erro vermelho ao tentar enviar os arquivos, use estes comandos no terminal:

```bash
# 1. Garante que todos os arquivos (incluindo App.tsx e index.html) estão prontos
git add .

# 2. Cria uma mensagem de registro
git commit -m "Envio completo do aplicativo"

# 3. Força o envio para o GitHub (O -f resolve o erro de conflito)
git push -u origin main -f
=======
## 📦 Como resolver o erro de "Push" (Rejeitado/Non-fast-forward)

Se aparecer o erro vermelho `[rejected] main -> main (non-fast-forward)` no VS Code, execute estes comandos:

```bash
# 1. Garante que todos os arquivos locais estão salvos
git add .
git commit -m "Preparando envio"

# 2. Força o envio para o GitHub (Isso resolve o conflito)
git push origin main -f
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
```

## 🛠️ Tecnologias
- **Frontend**: React + Tailwind CSS.
- **Banco de Dados**: Supabase (Realtime).
- **Hospedagem**: Vercel ou GitHub Pages.

<<<<<<< HEAD
## ⚠️ Importante
Nunca esqueça do ponto final no `git add .` - sem ele, o seu site fica em branco!
=======
## ⚠️ Checklist de Funcionamento
1. **Banco de Dados**: Você precisa ter criado as tabelas `members`, `users` e `announcements` no Supabase usando o código SQL fornecido.
2. **Chave API**: O arquivo `db.ts` **PRECISA** da sua chave que começa com `eyJ...`. Sem ela, o cadastro dará erro.
3. **PWA**: O app pode ser instalado no celular clicando em "Adicionar à tela inicial" no navegador (Chrome no Android ou Safari no iOS).
>>>>>>> be70c82 (Primeira versão do App Sentinelas)
