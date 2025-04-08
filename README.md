# infra

Este repositório tem como objetivo centralizar o gerenciamento e a orquestração de múltiplos serviços distribuídos em diferentes repositórios (multi-repo). Ele é ideal para ambientes de desenvolvimento local e testes integrados, oferecendo uma experiência padronizada e simplificada de execução dos projetos frontend, backend e banco de dados.

## 📦 Estrutura do Projeto

```bash
infra/
├── logs/                  # Diretório de logs persistentes
│   └── frontend.log
├── scripts/               # Scripts utilitários para execução automatizada
│   ├── start.sh           # Inicializa os serviços com validações
│   ├── stop.sh            # Finaliza os containers
│   └── utils.sh           # Funções compartilhadas
├── Makefile               # Atalhos para comandos frequentes
├── docker-compose.yml     # Orquestra todos os serviços
└── README.md
```

## 🚀 Como Usar

### Pré-requisitos
- Docker + Docker Compose
- Git

### 1. Clone os repositórios necessários

```bash
git clone https://github.com/sua-org/frontend.git
git clone https://github.com/sua-org/backend.git
git clone https://github.com/sua-org/infra.git
```

### 2. Estrutura esperada
Certifique-se de que os repositórios `frontend` e `backend` estejam no mesmo nível do diretório `infra`:

```bash
parent-folder/
├── backend/
├── frontend/
└── infra/
```

### 3. Inicie o ambiente local
Execute o script de start:

```bash
cd infra
./scripts/start.sh
```

Isso irá:
- Verificar se as portas 3000, 3306 e 8081 estão livres
- Rodar `docker compose down` para reiniciar o ambiente
- Iniciar o banco, frontend e backend em containers isolados
- Persistir os logs do frontend em `logs/frontend.log`

### 4. Parar os containers
```bash
./scripts/stop.sh
```

### 5. Atalhos com Makefile

```bash
make up      # Equivalente a ./scripts/start.sh
make down    # Equivalente a ./scripts/stop.sh
make logs    # Visualiza logs do frontend
```

## 🧪 Fluxo de Desenvolvimento

Sempre que fizer alterações em algum projeto (ex: frontend), utilize o `infra` para validar a integração:

1. `cd infra`
2. `./scripts/start.sh`
3. Verifique se os logs acusam erro
4. Se tudo estiver ok, volte ao projeto alterado e rode `docker compose up` localmente para desenvolvimento incremental

## 📌 Observações
- Esse repositório **não é utilizado em produção**, mas pode ser adaptado futuramente com variáveis e pipelines para isso.
- Todos os serviços dependem da rede compartilhada `infra-network`, definida no `docker-compose.yml`.

## 🧠 Para que serve o repositório infra?

Este repositório resolve a dor de cabeça de rodar manualmente cada serviço em seu próprio terminal ou pasta. Com ele você:
- Reduz a complexidade de boot de múltiplos serviços
- Garante que os serviços rodam em harmonia (com `depends_on`, `healthcheck` e logs)
- Centraliza os testes de integração (ideal para preparar pipelines de CI futuramente)

---

## ✅ Contribuições
Sinta-se à vontade para abrir issues e pull requests. Vamos juntos evoluir esta infraestrutura.

## 🛠️ Autor
Felipe Panosso

