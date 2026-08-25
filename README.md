# Gerenciador de Eventos — Frontend

Frontend web (mobile-first) do [Gerenciador de Eventos](https://github.com/joaogui01/gerenciador-de-eventos-backend), um app onde cada usuário pode organizar seus próprios eventos e se inscrever em eventos de outras pessoas — tickets são QR codes escaneados pelo organizador na entrada pra confirmar o check-in.

> ⚠️ **Fase de protótipo.** O app inteiro roda com dados de exemplo (mock), ainda não conectado à API real. Veja [Status do projeto](#status-do-projeto).

## Sobre o projeto

Interface pensada pra celular, seguindo o design feito no Figma. A mesma conta cobre dois papéis:

- **Organizador**: cria e gerencia os próprios eventos, vê a lista de participantes, convida gente por link, escaneia o QR code de cada um na entrada pra confirmar presença.
- **Participante**: navega pelos eventos de outras pessoas, se inscreve, e tem acesso ao próprio ticket (QR code) pra mostrar na entrada.

## Tecnologias

- **React** + **Vite**
- **lucide-react** (ícones)
- Estilização inline, seguindo os tokens de cor definidos no Figma (sem framework de CSS)

## Rodando o projeto

```bash
npm install
npm run dev
```

## Paleta de cores

| Nome | Uso | Cor |
|---|---|---|
| Main Green | `#00D09E` | Header, botões primários, item ativo da navegação, base da página (atrás de tudo) |
| Icon/Texto escuro | `#0E5C48` | Texto e ícones em geral (verde escuro, não preto) |
| Letters and Icons (Figma) | `#052224` | Ainda definido na paleta, mas sem uso ativo hoje — praticamente tudo migrou pro `#0E5C48` |
| Light Green | `#DFF7E2` | Fundo de inputs, navegação inferior |
| Background Green White | `#F1FFF3` | Fundo dos painéis brancos |
| Azul (links/datas) | `#0068FF` | Destaques como horário/data |

## Telas implementadas (protótipo)

**Entrada e autenticação**
- Tela de Carregamento (splash)
- Onboarding (3 slides, pulável)
- Tela Inicial (Conecte-se / Inscrever-se)
- Login (com link "Esqueceu sua senha?")
- Criar Conta
- Recuperar Senha

**Navegação principal**
- Home (explorar eventos, com busca e filtro por nome/local/data)
- Notificações
- Meus Eventos (com abas Ativos/Encerrados)
- Minhas Inscrições (com abas Ativos/Encerrados)
- Editar Meu Perfil (com Atualizar Perfil / Editar Senha / Sair / alternar entre perfil Usuário e Administrador)
- Alterar Senha

**Fluxo do participante**
- Detalhe de evento (visão de quem quer se inscrever)
- Ticket (QR code do participante, com cancelar inscrição)

**Fluxo do organizador**
- Cadastrar Evento / Editar Evento
- Gerenciar Evento (dados do evento + lista de participantes)
- Detalhes do participante (com cancelar inscrição)
- Convidar Participantes (link + copiar)
- Leitor de QR Code (com tela de confirmação de check-in dedicada)

**Genérica**
- Tela de Erro (ainda não é disparada por nada real — fica pronta pra quando conectarmos a API; hoje só é alcançável por um link discreto em Editar Meu Perfil, marcado como "(protótipo)")

**De fora, por decisão de produto:** nenhuma tela tem campo de preço — o projeto não envolve transação entre usuários.

## Status do projeto

- [x] **Experiência de administrador**: o backend já dá acesso total ao perfil `ADMIN` (ele ignora a checagem de dono nos endpoints de evento/inscrição/ticket/check-in — pode gerenciar qualquer evento, não só os próprios). No frontend, isso aparece em "Meus Eventos": no perfil `ADMIN`, a tela mostra os eventos de todo mundo (com "Organizado por X" em quem não é o usuário logado), não só os que o usuário criou. Não existe (nem no backend, nem aqui) um painel de administração separado com gestão de usuários, banimento, etc. — isso exigiria endpoints novos.
- [x] **Alternar entre perfil Usuário/Administrador**: como é tudo mock, adicionei um controle na tela de Perfil pra trocar entre as duas experiências sem precisar simular dois logins. Isso é só uma conveniência de protótipo — num app real, o perfil vem do próprio login (token JWT), ninguém escolhe.

- [x] Projeto scaffoldado com Vite + React de verdade (`npm install && npm run dev`).
- [x] Todas as telas do fluxo principal + telas de apoio (onboarding, notificações, recuperar/alterar senha, convidar, erro genérico) implementadas com dados de exemplo.
- [ ] Nenhuma tela está conectada à API real (`fetch` para o backend).
- [ ] Sem autenticação de verdade (login/token JWT) — `acaoLogin` só troca uma flag local.
- [ ] Sem leitura de câmera real no Leitor de QR Code (hoje tem um botão "Simular Leitura").
- [ ] QR code do ticket é só uma representação visual — o QR de verdade vem do backend (`GET /ticket/detalhar/{id}/qrcode`).
- [ ] "Alterar Senha", "Recuperar Senha" e "Atualizar Perfil" não têm endpoint correspondente no backend ainda — estão marcados com comentário no código (`// endpoint ainda não existe no backend`) em cada função `acao*`.
- [ ] "Histórico de eventos encerrados" usa um campo mock (`encerrado: true/false`) fixo nos dados de exemplo — no backend de verdade, isso provavelmente vai ser calculado a partir da data do evento, não um campo armazenado.
- [ ] Sem CORS configurado no ambiente de desenvolvimento (depende da configuração já feita no backend).
- [ ] Sem testes.

## Próximos passos sugeridos

1. Conectar as telas de login/cadastro à API real, guardando o token JWT.
2. Trocar as ações mock (`acaoInscrever`, `acaoCriarEvento`, `acaoConfirmarCheckin`, etc.) por chamadas `fetch` para os endpoints do backend.
3. Buscar e exibir o QR code real do ticket.
4. Implementar leitura de câmera real no Leitor de QR Code.
5. Decidir e implementar os endpoints que faltam no backend: atualizar perfil, alterar senha, recuperar senha, notificações.
6. Ajustar `CORS_ALLOWED_ORIGINS` no backend para o domínio deste frontend.
7. Trocar a `TelaErro` de "não disparada por nada" para o fallback real de erro de rede/API.
8. Deploy de teste.
