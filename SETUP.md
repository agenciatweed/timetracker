# Time Tracker — Deploy no Vercel

## Estrutura do projeto

```
index.html        ← App principal
api/data.js       ← Serverless function (lê/grava dados no Gist)
vercel.json       ← Configuração do Vercel
```

## Passo a passo

### 1. Criar um GitHub Gist para armazenar os dados

1. Acesse https://gist.github.com
2. Crie um novo Gist com:
   - **Filename:** `timetracker-data.json`
   - **Content:** `{"tasks":[],"archivedWeeks":[]}`
   - Marque como **Secret**
3. Após criar, copie o **Gist ID** da URL (ex: `https://gist.github.com/seu-user/abc123def456` → o ID é `abc123def456`)

### 2. Criar um Personal Access Token no GitHub

1. Acesse https://github.com/settings/tokens → **Generate new token (classic)**
2. Dê um nome como "Time Tracker"
3. Marque o scope **`gist`**
4. Gere e copie o token (começa com `ghp_...`)

### 3. Criar o repositório no GitHub

1. Crie um novo repositório (pode ser privado)
2. Suba os 3 arquivos: `index.html`, `api/data.js`, `vercel.json`

### 4. Deploy no Vercel

1. Acesse https://vercel.com e importe o repositório
2. Nas **Environment Variables**, adicione:
   - `GITHUB_TOKEN` = seu Personal Access Token
   - `GIST_ID` = o ID do Gist criado no passo 1
   - `API_SECRET` = uma senha qualquer (opcional, mas recomendado para segurança)
3. Deploy!

### 5. Se usou API_SECRET

Abra o `index.html` e altere a linha:
```javascript
const API_SECRET = '';
```
para:
```javascript
const API_SECRET = 'sua-senha-aqui';
```

### 6. Migrar dados existentes do localStorage

Se você já tem dados no time tracker local:

1. Abra o time tracker antigo (arquivo HTML local) no browser
2. Abra o Console (F12 → Console)
3. Execute: `copy(localStorage.getItem('timetracker_v2'))`
4. Abra o time tracker no Vercel
5. Abra o Console e execute: `localStorage.setItem('timetracker_v2', '...cole aqui...')`
6. Recarregue a página — os dados locais serão enviados para a API automaticamente

Pronto! O app vai sincronizar dados via GitHub Gist e funcionar em qualquer máquina.
