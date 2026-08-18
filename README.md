# Gerenciador de Eventos — Frontend

Frontend web (mobile-first) do [Gerenciador de Eventos](https://github.com/joaogui01/gerenciador-de-eventos-backend), um app onde cada usuário pode organizar seus próprios eventos e se inscrever em eventos de outras pessoas — tickets são QR codes escaneados pelo organizador na entrada pra confirmar o check-in.

> ⚠️ **Fase de protótipo.** Hoje existe uma tela navegável com dados de exemplo (mock), ainda não conectada à API real. Veja [Status do projeto](#status-do-projeto).

## Sobre o projeto

Interface pensada pra celular, seguindo o design feito no Figma. A mesma conta cobre dois papéis:

- **Organizador**: cria e gerencia os próprios eventos, vê a lista de participantes, escaneia o QR code de cada um na entrada pra confirmar presença.
- **Participante**: navega pelos eventos de outras pessoas, se inscreve, e tem acesso ao próprio ticket (QR code) pra mostrar na entrada.

## Tecnologias

- **React**
- **lucide-react** (ícones)
- Estilização inline, seguindo os tokens de cor definidos no Figma (sem framework de CSS por enquanto)

## Paleta de cores

Extraída do Figma:

| Nome | Uso | Cor |
|---|---|---|
| Main Green | `#00D09E` | Header, botões primários, item ativo da navegação |
| Letters and Icons | `#052224` | Texto e ícones |
| Light Green | `#DFF7E2` | Fundo de inputs, navegação inferior |
| Background Green White | `#F1FFF3` | Fundo das telas |
| Azul (links/datas) | `#0068FF` | Destaques como horário/data |

## Telas implementadas (protótipo)

- Login / Criar conta
- Home (explorar eventos, com busca e filtro por nome/local/data)
- Detalhe de evento (visão de quem quer se inscrever)
- Meus Eventos (lista do organizador)
- Cadastrar Evento / Editar Evento
- Gerenciar Evento (visão do organizador: dados do evento + lista de participantes)
- Detalhes do participante (com cancelar inscrição)
- Leitor de QR Code (check-in)
- Minhas Inscrições
- Ticket (QR code do participante)
- Perfil

**De fora por enquanto** (o backend ainda não suporta): Notificações e Alterar Senha. Também não há campo de preço em nenhuma tela — o projeto não envolve transação entre usuários.

## Status do projeto

- [x] Protótipo navegável com todas as telas principais e dados de exemplo (mock).
- [ ] Projeto ainda não scaffoldado como app de verdade (sem `package.json`, build, ou estrutura de pastas — hoje é um componente único).
- [ ] Nenhuma tela está conectada à API real (`fetch` para o backend).
- [ ] Sem autenticação de verdade (login/token JWT).
- [ ] Sem leitura de câmera real no Leitor de QR Code (hoje tem um botão "Simular Leitura").
- [ ] QR code do ticket é só uma representação visual — o QR de verdade vem do backend (`GET /ticket/detalhar/{id}/qrcode`).
- [ ] Sem CORS configurado no ambiente de desenvolvimento (depende da configuração já feita no backend).
- [ ] Sem testes.

## Próximos passos sugeridos

1. Criar o projeto de verdade (Vite + React) e migrar o protótipo pra essa estrutura.
2. Conectar as telas de login/cadastro à API real, guardando o token JWT.
3. Trocar as ações mock (`acaoInscrever`, `acaoCriarEvento`, etc.) por chamadas `fetch` para os endpoints do backend.
4. Buscar e exibir o QR code real do ticket.
5. Implementar leitura de câmera real no Leitor de QR Code.
6. Ajustar `CORS_ALLOWED_ORIGINS` no backend para o domínio deste frontend.
7. Deploy de teste.
