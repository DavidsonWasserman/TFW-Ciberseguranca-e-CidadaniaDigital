# MFA

API de demonstração de autenticação multifator (2FA) usando códigos TOTP, compatíveis com aplicações como Google Authenticator, Microsoft Authenticator e Authy.

## Sumário

- [Introdução](#introdução)
- [Tecnologias](#tecnologias)
- [Como começar](#como-começar)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação e execução](#instalação-e-execução)
  - [Credencial de demonstração](#credencial-de-demonstração)
- [Fluxo de utilização](#fluxo-de-utilização)
  - [1. Fazer login](#1-fazer-login)
  - [2. Configurar o 2FA](#2-configurar-o-2fa)
  - [3. Ativar o 2FA](#3-ativar-o-2fa)
  - [4. Confirmar o segundo fator no login](#4-confirmar-o-segundo-fator-no-login)
- [Referência da API](#referência-da-api)
  - [Autenticação](#autenticação)
  - [Tabela de endpoints](#tabela-de-endpoints)
  - [POST /login](#post-login)
  - [POST /2fa/verify](#post-2faverify)
  - [POST /2fa/setup](#post-2fasetup)
  - [POST /2fa/enable](#post-2faenable)
  - [POST /2fa/disable](#post-2fadisable)
- [Estrutura principal](#estrutura-principal)
- [Observações de segurança](#observações-de-segurança)

## Introdução

A estação implementa um fluxo de login em duas etapas:

1. O usuário informa nome de usuário e senha.
2. Se o 2FA estiver habilitado, a API solicita um código temporário gerado pelo aplicativo autenticador.

Os tokens são JWTs. O token temporário do segundo fator expira em 5 minutos e o token de acesso completo expira em 1 hora. Os usuários são mantidos somente em memória; por isso, os dados e a configuração do 2FA são perdidos quando o servidor é reiniciado.

## Tecnologias

- [Node.js](https://nodejs.org/docs/latest/api/) - Ambiente de execução JavaScript server-side
- [TypeScript](https://www.typescriptlang.org/docs/) - Superset tipado do JavaScript
- [Fastify](https://fastify.dev/docs/latest/) - Framework web de alta performance para Node.js
- [`@fastify/jwt`](https://github.com/fastify/fastify-jwt) - Plugin do Fastify para assinatura e verificação de JWT
- [`@fastify/static`](https://github.com/fastify/fastify-static) - Plugin do Fastify para servir a página estática de demonstração
- [`otplib`](https://github.com/yeojz/otplib) - Biblioteca para geração e validação de tokens TOTP (RFC 6238)
- [`qrcode`](https://github.com/soldair/node-qrcode) - Gerador de QR Code em formato Data URL para aplicativos autenticadores

## Como começar

### Pré-requisitos

- Node.js instalado
- npm instalado

### Instalação e execução

No diretório `MFA`, instale as dependências:

```bash
npm install
```

Defina uma chave segura para assinar os JWTs. Em desenvolvimento, o projeto possui uma chave padrão, mas ela não deve ser usada em ambientes reais:

```bash
# Linux ou macOS
export JWT_SECRET="substitua-por-uma-chave-longa-e-segura"

# Windows PowerShell
$env:JWT_SECRET = "substitua-por-uma-chave-longa-e-segura"
```

Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Para compilar e executar a versão compilada:

```bash
npm run build
npm start
```

A API fica disponível em `http://localhost:3000`. A página estática de demonstração pode ser acessada em `http://localhost:3000/`.

### Credencial de demonstração

O projeto disponibiliza o usuário:

- Usuário: `alunorural`
- Senha: `senha123`

Essa credencial existe apenas para demonstração. Em uma aplicação real, os usuários devem ser armazenados em um banco de dados e as credenciais não devem ser expostas na documentação.

## Fluxo de utilização

### 1. Fazer login

Rota: `POST /login`

```json
{
  "username": "alunorural",
  "password": "senha123"
}
```

Se o 2FA estiver desativado, a resposta conterá `twoFactorRequired: false` e um `token` de acesso completo.

Se o 2FA estiver ativado, a resposta conterá `twoFactorRequired: true` e um `tempToken`. Use esse token somente na rota `/2fa/verify`.

As rotas protegidas devem receber um cabeçalho de autenticação Bearer com o token completo ou temporário, conforme o fluxo.

### 2. Configurar o 2FA

Com um token de acesso completo, solicite um segredo e um QR Code:

Rota: `POST /2fa/setup`

```json
{}
```

Cadastre o QR Code retornado no aplicativo autenticador. O campo `secret` também pode ser usado para cadastro manual.

### 3. Ativar o 2FA

Informe o código exibido no aplicativo:

Rota: `POST /2fa/enable`

```json
{
  "code": "123456"
}
```

Depois da ativação, novos logins exigirão a segunda etapa.

### 4. Confirmar o segundo fator no login

Use o `tempToken` recebido no login:

Rota: `POST /2fa/verify`

```json
{
  "code": "123456"
}
```

A resposta conterá o `token` de acesso completo, válido por 1 hora.

## Referência da API

### Autenticação

As rotas protegidas utilizam autenticação via token JWT no cabeçalho HTTP:

```http
Authorization: Bearer <token>
```

A API trabalha com dois tipos de token (distinguidos internamente pelo campo `purpose`):

- **Token Temporário (`tempToken`)**: Possui `purpose: "2fa"` e expira em **5 minutos**. É retornado na rota `/login` quando o usuário possui o 2FA ativado. Tem permissão restrita, sendo aceito exclusivamente na rota `/2fa/verify`.
- **Token de Acesso Completo (`token`)**: Possui `purpose: "full"` e expira em **1 hora**. É retornado diretamente no `/login` (caso o 2FA esteja desativado) ou no `/2fa/verify` (após a validação do código TOTP). É obrigatório para acessar as operações de gerenciamento de dois fatores (`/2fa/setup`, `/2fa/enable` e `/2fa/disable`).

### Tabela de endpoints

Todas as rotas utilizam o método `POST`.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/login` | Nenhuma | Autentica com credenciais de usuário e senha. |
| `POST` | `/2fa/verify` | Bearer (`tempToken`) | Valida código TOTP no fluxo de login e emite token de acesso completo. |
| `POST` | `/2fa/setup` | Bearer (`token` completo) | Inicia configuração gerando segredo pendente, URI `otpauth` e QR Code. |
| `POST` | `/2fa/enable` | Bearer (`token` completo) | Confirma código do aplicativo autenticador e ativa o 2FA. |
| `POST` | `/2fa/disable` | Bearer (`token` completo) | Valida código atual e desativa o 2FA da conta. |

---

### POST /login

Inicia o fluxo de autenticação a partir de nome de usuário e senha.

- **Autenticação:** Nenhuma
- **Cabeçalhos:**
  - `Content-Type: application/json`

#### Corpo da requisição (JSON)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `username` | `string` | Sim | Nome de usuário cadastrado. |
| `password` | `string` | Sim | Senha do usuário. |

Exemplo:
```json
{
  "username": "alunorural",
  "password": "senha123"
}
```

#### Respostas

- **`200 OK` (2FA Desabilitado)**: Login concluído diretamente com emissão do token completo.
  ```json
  {
    "twoFactorRequired": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **`200 OK` (2FA Habilitado)**: Login parcial; exige envio do código TOTP em `/2fa/verify`.
  ```json
  {
    "twoFactorRequired": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **`401 Unauthorized`**: Usuário inexistente ou senha incorreta.
  ```json
  {
    "error": "Nome de usuário ou senha inválidos"
  }
  ```

---

### POST /2fa/verify

Valida o código TOTP de 6 dígitos gerado pelo aplicativo autenticador para concluir o login quando o 2FA está ativo.

- **Autenticação:** Bearer Token com `tempToken` (purpose `2fa`)
- **Cabeçalhos:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <tempToken>`

#### Corpo da requisição (JSON)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `code` | `string` | Sim | Código TOTP de 6 dígitos exibido no aplicativo autenticador. |

Exemplo:
```json
{
  "code": "123456"
}
```

#### Respostas

- **`200 OK`**: Código validado com sucesso; retorna token de acesso completo.
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- **`401 Unauthorized`**: Código TOTP incorreto ou token temporário inválido/expirado.
  ```json
  {
    "error": "Código de verificação inválido"
  }
  ```
  *ou*
  ```json
  {
    "error": "Token temporário inválido ou expirado"
  }
  ```

---

### POST /2fa/setup

Gera uma nova chave secreta TOTP pendente, a URI correspondente e um QR Code em Data URL pronto para ser escaneado.

- **Autenticação:** Bearer Token com `token` completo (purpose `full`)
- **Cabeçalhos:**
  - `Authorization: Bearer <token>`
- **Corpo da requisição:** Vazio (`{}`)

#### Respostas

- **`200 OK`**: Setup gerado com sucesso.
  ```json
  {
    "secret": "JBSWY3DPEHPK3PXP",
    "otpauthUrl": "otpauth://totp/MFA-Demo:alunorural?secret=JBSWY3DPEHPK3PXP&issuer=MFA-Demo",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```

- **`400 Bad Request`**: O 2FA já se encontra ativo na conta.
  ```json
  {
    "error": "2FA já está ativo"
  }
  ```

- **`401 Unauthorized`**: Token de autenticação ausente, inválido ou expirado.
  ```json
  {
    "error": "Token inválido ou expirado"
  }
  ```

---

### POST /2fa/enable

Valida o primeiro código TOTP gerado com a chave do setup e efetiva a ativação do 2FA.

- **Autenticação:** Bearer Token com `token` completo (purpose `full`)
- **Cabeçalhos:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

#### Corpo da requisição (JSON)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `code` | `string` | Sim | Código TOTP de 6 dígitos gerado pelo aplicativo a partir do QR Code/secret escaneado. |

Exemplo:
```json
{
  "code": "123456"
}
```

#### Respostas

- **`200 OK`**: 2FA ativado com sucesso.
  ```json
  {
    "message": "2FA ativado com sucesso"
  }
  ```

- **`400 Bad Request`**: Não há configuração pendente (necessário chamar `/2fa/setup` primeiro).
  ```json
  {
    "error": "É necessário executar o setup primeiro"
  }
  ```

- **`401 Unauthorized`**: Código informado inválido ou token de autenticação inválido.
  ```json
  {
    "error": "Código inválido"
  }
  ```
  *ou*
  ```json
  {
    "error": "Token inválido ou expirado"
  }
  ```

---

### POST /2fa/disable

Desativa o 2FA para o usuário mediante confirmação do código TOTP atual.

- **Autenticação:** Bearer Token com `token` completo (purpose `full`)
- **Cabeçalhos:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

#### Corpo da requisição (JSON)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `code` | `string` | Sim | Código TOTP de 6 dígitos atual do aplicativo autenticador. |

Exemplo:
```json
{
  "code": "123456"
}
```

#### Respostas

- **`200 OK`**: 2FA desativado com sucesso.
  ```json
  {
    "message": "2FA desativado"
  }
  ```

- **`401 Unauthorized`**: Código TOTP incorreto, 2FA não ativo ou token inválido.
  ```json
  {
    "error": "Código de verificação inválido"
  }
  ```
  *ou*
  ```json
  {
    "error": "Token inválido ou expirado"
  }
  ```

## Estrutura principal

```text
src/
  lib/
    auth.ts       # Validação dos tokens JWT
    totp.ts       # Geração e validação dos códigos TOTP
    users.ts      # Usuário de demonstração e credenciais em memória
  routes/
    authRoute.ts  # Login e verificação do segundo fator
    twofaRoute.ts # Configuração, ativação e desativação do 2FA
  server.ts       # Inicialização do Fastify
public/
  index.html      # Página estática de demonstração
```

## Observações de segurança

Este projeto tem finalidade didática.
