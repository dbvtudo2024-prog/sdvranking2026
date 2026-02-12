# Sentinelas da Verdade - App de Gestão

Este é o aplicativo oficial do Clube de Desbravadores **Sentinelas da Verdade**.

## 🚀 Como hospedar na Vercel (Recomendado)

A Vercel é mais rápida e fácil para apps React. Siga estes passos:

1.  Acesse [vercel.com](https://vercel.com) e crie uma conta (pode usar seu GitHub).
2.  Clique em **"Add New"** > **"Project"**.
3.  Importe o seu repositório `sentinelas-da-verdade`.
4.  Em **Build & Development Settings**, a Vercel detectará automaticamente as configurações. 
5.  Clique em **"Deploy"**.

## 📦 Como resolver o erro de "Push" no VS Code

Se aparecer um erro vermelho ao tentar enviar os arquivos, use estes comandos no terminal:

```bash
# 1. Garante que todos os arquivos (incluindo App.tsx e index.html) estão prontos
git add .

# 2. Cria uma mensagem de registro
git commit -m "Envio completo do aplicativo"

# 3. Força o envio para o GitHub (O -f resolve o erro de conflito)
git push -u origin main -f
```

## 🛠️ Tecnologias
- **Frontend**: React + Tailwind CSS.
- **Banco de Dados**: Supabase (Realtime).
- **Hospedagem**: Vercel ou GitHub Pages.

## ⚠️ Importante
Nunca esqueça do ponto final no `git add .` - sem ele, o seu site fica em branco!