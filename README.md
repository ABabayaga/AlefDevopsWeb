# 🌐 Alef Devops – Personal Web3 Portfolio

Este é o repositório do meu site pessoal https://alefdevops.com, criado para apresentar meus projetos, trajetória profissional e visão sobre desenvolvimento Web3 e descentralização.

## 🚀 Sobre o Projeto

O site foi desenvolvido com o objetivo de ser um ponto de contato profissional, um portfólio e também um espaço para compartilhar ideias sobre:

- Blockchain, DAOs e contratos inteligentes
- Transparência, autonomia e segurança digital
- Desenvolvimento de soluções Web3 de forma prática e acessível

> "The future demands transparency, decentralization, autonomy, trust, and security."

## 🎨 Identidade visual

O layout usa o vocabulário de quem trabalha com fibra óptica e monitoramento de rede: fundo escuro com viés azul de tela de NOC, rótulos técnicos em fonte monoespaçada e acentos tirados das jaquetas padronizadas de fibra — amarelo para monomodo (OS2) e aqua para multimodo (OM3). A assinatura da home é um traço de OTDR desenhado em SVG, em que cada evento marca uma etapa da trajetória: telecom, gestão e web3.

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** (React, pages router)
- **TypeScript**
- **Tailwind CSS v4** para o layout e responsividade
- **three.js** para a cena WebGL do hero (três cascas concêntricas dirigidas por scroll)
- **next-i18next** para internacionalização (português como padrão e inglês)
- **Vercel** para deploy contínuo
- **Nodemailer** (no backend) para envio de e-mails via formulário de contato

## 💻 Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:3000
npm run build    # build de produção
npm start        # serve o build de produção
```

O formulário de contato depende de credenciais SMTP. Copie `.env.example` para `.env` e preencha `SMTP_USER` e `SMTP_PASS` (senha de aplicativo do Gmail).

> ℹ️ As seções de contato, sobre e skills estão temporariamente desativadas na home enquanto passam por reescrita — o código de cada uma segue no repositório, em `src/components/sections/`.

## 📚 Estrutura e convenções

A arquitetura do projeto, o design system e as convenções de i18n estão documentados em [`CLAUDE.md`](./CLAUDE.md).
