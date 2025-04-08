# 🚀 infra-hero

Infraestrutura Dockerizada para orquestração de múltiplos serviços — **frontend, backend, banco de dados e proxy reverso** — com suporte a ambientes de desenvolvimento e produção simplificados via `docker-compose`.

---

## 📌 Objetivo

Este projeto tem como objetivo centralizar e simplificar o gerenciamento da infraestrutura de aplicações com múltiplos repositórios (multi-repo), permitindo que backend, frontend e serviços auxiliares sejam orquestrados de forma unificada.

---

## ⚙️ Tecnologias Utilizadas

- Docker
- Docker Compose
- Nginx (Proxy reverso) (será alterado para ngrok futuramente)
- Makefile (para automação)
- Scripts Shell (`scripts/`)

---

## 🧭 Fluxo de Rede dos Serviços

```
[ Navegador ] ⇄ http://localhost → [ NGINX (porta 80) ]
                           ├── /api → Backend (porta 8080)
                           └── /     → Frontend (porta 3000)
```

---

## 🏗 Estrutura

```
infra-hero/
├── docker-compose.yml
├── Makefile
├── nginx/
│   └── nginx.conf
├── scripts/
│   └── start.sh
├── logs/
│   └── frontend.log (gerado automaticamente)
```

---

## 📂 Requisitos

- Backend e frontend possuem seus próprios `Dockerfile` (com nomes `Dockerfile.backend` e `Dockerfile.frontend`).
- Estrutura:

```
infra-hero/
├── frontend/
│   ├── Dockerfile.frontend
│   └── start-frontend.sh
├── backend/
│   ├── Dockerfile.backend
│   └── start-backend.sh
```

> 🔁 Os scripts `start-*.sh` são usados pelo Docker para iniciar os serviços e podem conter comandos customizados.

---

## 🚀 Como rodar localmente

1. Clone este repositório `infra-hero`
2. Adicione os repositórios do **backend** e **frontend** como subpastas.
3. Execute:

```bash
make up
```

Isso irá:
- Verificar se as portas 3000 e 8080 estão disponíveis
- Derrubar containers antigos (`docker compose down`)
- Subir os containers com rebuild (`docker compose up --build`)
- Criar logs persistentes no diretório `logs/`

---

## 🛠 Comandos

| Comando         | Ação                                                         |
|----------------|--------------------------------------------------------------|
| `make up`      | Sobe todos os serviços com rebuild                           |
| `make down`    | Derruba todos os containers                                  |
| `make rebuild` | Rebuilda sem subir                                           |
| `make logs`    | Mostra logs do frontend                                      |

---

## 🧱 Organização do Projeto

- `docker-compose.yml`: define os serviços `nginx`, `frontend`, `backend`
- `nginx.conf`: direciona o tráfego para `/api` (backend) e `/` (frontend)
- `Makefile`: interface automatizada para comandos comuns
- `scripts/start.sh`: script principal de inicialização com validações

---

## 🧪 Testando após alterações

Ao alterar o código do backend ou frontend:

1. Salva as alterações nos respectivos projetos
2. Executa `make up` no repositório `infra-hero`
3. O Docker irá rebuildar e subir os containers atualizados

> ✅ Não é necessário rodar `docker compose up` nos projetos individuais.

---

## 🔐 SSL e Produção (futuro)

HTTPS em produção:

1. Gerar/obter certificados oficiais
2. Criar a pasta `ssl/` com os arquivos:
   - `cert.pem`
   - `privkey.pem`
   - `fullchain.pem`
3. Atualizar o `nginx.conf` com suporte a SSL

---

## 🧠 Autoria

Desenvolvido por Felipe Panosso.  

---

## 📄 Licença

MIT License.
