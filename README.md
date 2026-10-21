# NestJS Toxicity Guardrail with TensorFlow.js & Ollama

Edge Guardrail corporativo desenvolvido em **NestJS** para interceptar, moderar e bloquear prompts maliciosos, ofensivos ou tóxicos em memória utilizando **TensorFlow.js**, antes que atinjam a camada de orquestração do **LangChain.js** e o modelo de linguagem local no **Ollama**.

---

## 🎯 Objetivo Arquitetural

Em sistemas orientados a GenAI, enviar qualquer entrada diretamente para inferência de LLMs gera desperdício de recursos computacionais (VRAM/CPU), latência desnecessária e custos operacionais elevados com provedores externos (FinOps).

Este projeto introduz um **curto-circuito em nível de infraestrutura de aplicação**:

* **Requisição Tóxica:** Interceptada em dezenas de milissegundos localmente pelo modelo Toxicity do TF.js. A execução é abortada no Guard do NestJS com status `400 Bad Request`, consumindo 0 ciclos de GPU do LLM.
* **Requisição Legítima:** Prossegue normalmente para o controller e despacha a cadeia de execução do LangChain integrada com o Ollama (`qwen2.5:7b`).

---

## 🏛️ Diagrama de Fluxo

```text
[ Client Request ]
       │
       ▼
 ┌──────────────┐
 │  POST /chat  │
 └──────┬───────┘
        │
        ▼
 ┌─────────────────────────┐
 │      ToxicityGuard      │
 │  (TensorFlow.js / WASM) │
 └────────────┬────────────┘
              │
      ┌───────┴────────────────────────┐
      │                                │
 [isToxic == true]             [isToxic == false]
      │                                │
      ▼                                ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│ HTTP 400 Bad Request      │   │      ChatController       │
│ - Abortado em ~25ms       │   └─────────────┬─────────────┘
│ - 0 tokens de LLM gastos  │                 │
│ - 0 processamento de VRAM │                 ▼
└───────────────────────────┘   ┌───────────────────────────┐
                                │     LangChain LCEL        │
                                └─────────────┬─────────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │   Ollama (qwen2.5:7b)     │
                                └─────────────┬─────────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │ HTTP 201 Created          │
                                └───────────────────────────┘

```

---

## 🚀 Tecnologias

* **Framework:** NestJS 11+ (TypeScript, ESM)
* **Edge ML:** TensorFlow.js (`@tensorflow/tfjs` + `@tensorflow-models/toxicity`)
* **Orquestração LLM:** LangChain.js (`@langchain/core`, `@langchain/ollama`)
* **LLM Local:** Ollama (`qwen2.5:7b` ou `llama3.2`)
* **Containerização:** Docker & Docker Compose

---

## 📋 Pré-requisitos

* Node.js 20+ ou 22+ LTS
* Docker e Docker Compose instalados
* Instância do Ollama em execução com o modelo baixado:
```bash
docker exec -it ollama ollama pull qwen2.5:7b

```



---

## ⚙️ Instalação e Execução Local

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/seu-usuario/guardrail-llm-service.git
cd guardrail-llm-service
npm install

```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
OLLAMA_BASE_URL=http://localhost:11434

```

### 3. Rodar em modo de desenvolvimento

```bash
npm run start:dev

```

---

## 🐳 Execução via Docker Compose

Caso o seu container do Ollama já esteja rodando na rede do host:

1. Garanta que a rede externa exista e o container do Ollama esteja acoplado:
```bash
docker network create ai-network
docker network connect ai-network ollama

```


2. Suba o container da aplicação:
```bash
docker compose up -d --build

```


3. Verifique os logs da aplicação:
```bash
docker compose logs -f api

```



---

## 🧪 Exemplos de Requisição (cURL)

### 1. Cenário Permitido (Requisição Legítima)

Prompt técnico seguro que passa pela validação e é enviado ao Ollama:

```bash
curl -i -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explique a diferença entre filas RabbitMQ e streams do Kafka de forma sucinta."
  }'

```

**Resposta esperada (`HTTP/1.1 201 Created`):**

```json
{
  "response": "RabbitMQ é projetado para filas de mensagens tradicionais e roteamento flexível, enquanto o Apache Kafka opera como um log distribuído de eventos com alta taxa de transferência e retenção temporal.",
  "processingTimeMs": 1420.55
}

```

---

### 2. Cenário Bloqueado (Toxicidade / Insulto)

Prompt contendo palavras ofensivas ou violações de conduta:

```bash
curl -i -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "You are a complete idiot, shut up and delete your code"
  }'

```

**Resposta esperada (`HTTP/1.1 400 Bad Request`):**

```json
{
  "statusCode": 400,
  "message": "Prompt bloqueado por violar diretrizes de moderação.",
  "blockedCategories": [
    "insult",
    "toxicity"
  ]
}

```

---

### 3. Cenário Bloqueado (Ameaça / Threat)

```bash
curl -i -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I will find you and I will hurt you"
  }'

```

**Resposta esperada (`HTTP/1.1 400 Bad Request`):**

```json
{
  "statusCode": 400,
  "message": "Prompt bloqueado por violar diretrizes de moderação.",
  "blockedCategories": [
    "threat",
    "toxicity"
  ]
}

```

---

## 📊 Comparativo de Performance

| Métrica | Requisição Bloqueada (Curto-Circuito) | Requisição Válida (LLM) |
| --- | --- | --- |
| **Camada Atingida** | NestJS Guard (TensorFlow.js) | LangChain + Ollama |
| **Tempo de Resposta** | ~20ms - 40ms | ~1200ms - 2500ms |
| **Consumo de VRAM/GPU** | 0% | 100% durante geração de tokens |
| **Consumo de Tokens** | 0 tokens | $N$ tokens de entrada + saída |

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.