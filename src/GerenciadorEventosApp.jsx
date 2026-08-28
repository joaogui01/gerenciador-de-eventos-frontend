import React, { useState, useEffect } from "react";
import {
  Home, CalendarDays, User, ArrowLeft, Plus, Eye, EyeOff,
  MapPin, Calendar, Search, MoreVertical, LogOut, Users as UsersIcon,
  ScanLine, Ticket as TicketIcon, Bell, Loader,
  CheckCircle2, TriangleAlert, Share2,
} from "lucide-react";

/*
 * Protótipo de frontend do Gerenciador de Eventos.
 *
 * Estado atual: roda 100% com dados de exemplo (mock), sem chamar a API de verdade.
 * Todas as funções que mexem em dados (login, cadastro, criar evento, inscrever-se,
 * cancelar inscrição, escanear ticket) estão isoladas nas funções "acao*" lá embaixo,
 * junto com um comentário indicando o endpoint real do backend que vai substituir
 * a lógica mock quando conectarmos de verdade.
 *
 * Não tem: Notificações e Alterar Senha (o backend ainda não suporta) e nenhum
 * campo de preço (decisão do projeto: não há transação entre usuários).
 */

const COR = {
  verde: "#00D09E",
  escuro: "#052224",
  iconeEscuro: "#0E5C48",
  verdeClaro: "#DFF7E2",
  fundo: "#F1FFF3",
  neon: "#00E676",
  branco: "#FFFFFF",
};

// ---------- dados de exemplo ----------

// Formata dígitos digitados no padrão DD/MM/AAAA, inserindo as barras automaticamente
// conforme a pessoa digita (e ignora qualquer caractere que não seja número).
function mascararData(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  const partes = [];
  if (digitos.length > 0) partes.push(digitos.slice(0, 2));
  if (digitos.length > 2) partes.push(digitos.slice(2, 4));
  if (digitos.length > 4) partes.push(digitos.slice(4, 8));
  return partes.join("/");
}

const usuarioMock = {
  idUsuario: 1,
  nome: "Fernando",
  login: "fernando99",
  telefone: "+55 86 999990000",
  cpf: "12345678900",
  perfil: "USER",
};

const eventosExplorarIniciais = [
  { idEvento: 301, nomeEvento: "ExpoFest", localEvento: "Paulistana", dataEvento: "30/04/2026", hora: "21h", descricaoEvento: "Feira de exposições da cidade, com barracas, música ao vivo e artesanato local.", organizador: "Coletivo ExpoFest", vagasTotaisEvento: 100, vagasDisponiveisEvento: 42, statusGeral: "ATIVO", encerrado: false, participantes: [] },
  { idEvento: 302, nomeEvento: "ExpoThe", localEvento: "Teresina", dataEvento: "15/04/2026", hora: "8h30", descricaoEvento: "Encontro de apreciadores de chá, com degustação e workshops.", organizador: "Marina Chás", vagasTotaisEvento: 50, vagasDisponiveisEvento: 9, statusGeral: "ATIVO", encerrado: false, participantes: [] },
  { idEvento: 303, nomeEvento: "Feira do Livro", localEvento: "Teresina", dataEvento: "22/05/2026", hora: "9h", descricaoEvento: "Feira literária com lançamentos, bate-papos e sebo colaborativo.", organizador: "Biblioteca Municipal", vagasTotaisEvento: 200, vagasDisponiveisEvento: 180, statusGeral: "ATIVO", encerrado: false, participantes: [] },
];

const meusEventosIniciais = [
  {
    idEvento: 101,
    nomeEvento: "ExpoPatos",
    descricaoEvento: "Evento para apreciação de patos.",
    dataEvento: "24/04/2026",
    hora: "17h",
    localEvento: "UFPI",
    organizador: usuarioMock.nome,
    vagasTotaisEvento: 20,
    vagasDisponiveisEvento: 12,
    statusGeral: "ATIVO",
    encerrado: false,
    participantes: [
      { idUsuario: 11, nome: "Carla", login: "Carla1534", telefone: "+55 89 994556677", checkin: false },
      { idUsuario: 12, nome: "Raimundo", login: "Raimundo22", telefone: "+55 86 991112233", checkin: false },
    ],
  },
  {
    idEvento: 102,
    nomeEvento: "ExpoSantos",
    descricaoEvento: "Evento para apreciação do porto de Santos.",
    dataEvento: "24/04/2026",
    hora: "17h",
    localEvento: "Santos",
    organizador: usuarioMock.nome,
    vagasTotaisEvento: 30,
    vagasDisponiveisEvento: 25,
    statusGeral: "ATIVO",
    encerrado: false,
    participantes: [],
  },
  {
    idEvento: 103,
    nomeEvento: "ExpoPatos 2025",
    descricaoEvento: "Edição do ano passado do evento.",
    dataEvento: "10/03/2025",
    hora: "16h",
    localEvento: "UFPI",
    organizador: usuarioMock.nome,
    vagasTotaisEvento: 15,
    vagasDisponiveisEvento: 0,
    statusGeral: "ATIVO",
    encerrado: true,
    participantes: [{ idUsuario: 13, nome: "Joana", login: "Joana2020", telefone: "+55 86 990001111", checkin: true }],
  },
];

// Lista "de verdade" com todo evento que existe no sistema — junta os que o usuário
// mock organiza (meusEventosIniciais) com os de outras pessoas (eventosExplorarIniciais).
// É o que o ADMIN enxerga na íntegra; o usuário comum vê só o subconjunto onde ele é
// o organizador (ver o filtro em torno de "meusEventos" dentro do componente principal).
const todosEventosIniciais = [
  ...meusEventosIniciais,
  ...eventosExplorarIniciais.map((e) => ({ ...e, statusGeral: "ATIVO", encerrado: false, participantes: [] })),
];

const minhasInscricoesIniciais = [
  { idInscricao: 501, idEvento: 301, nomeEvento: "ExpoFest", localEvento: "Paulistana", dataEvento: "30/04/2026", hora: "21h", descricaoEvento: "Feira de exposições da cidade, com barracas, música ao vivo e artesanato local.", organizador: "Coletivo ExpoFest", codigoHashTicket: "a1b2-c3d4-e5f6", encerrado: false },
  { idInscricao: 502, idEvento: 304, nomeEvento: "ExpoThe 2025", localEvento: "Teresina", dataEvento: "15/04/2025", hora: "8h30", descricaoEvento: "Encontro de apreciadores de chá do ano passado.", organizador: "Marina Chás", codigoHashTicket: "f6e5-d4c3-b2a1", encerrado: true },
];

const notificacoesMock = [
  { id: 1, tipo: "participante", titulo: "Novo Integrante No Seu Evento!", texto: "Uma nova pessoa entrou no seu evento. Confira os participantes!", quando: "17h – 24/04/2026" },
  { id: 2, tipo: "evento", titulo: "Novo Evento Adicionado!", texto: "Um novo evento foi adicionado. Confira os detalhes!", quando: "17h – 24/04/2026" },
];

// ---------- marca EventFlow ----------

// Aproximação do ícone do Figma (headset dentro de um balão de conversa).
// Se você tiver o SVG exato exportado do Figma, é só trocar esse componente.
function LogoEventFlow({ size = 64, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 10 H52 a4 4 0 0 1 4 4 V38 a4 4 0 0 1 -4 4 H24 L15 50 V42 H12 a4 4 0 0 1 -4 -4 V14 a4 4 0 0 1 4 -4 Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 29 V25 a12 12 0 0 1 24 0 V29" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="17" y="27" width="7" height="10" rx="3" stroke={color} strokeWidth="2.5" fill="none" />
      <rect x="40" y="27" width="7" height="10" rx="3" stroke={color} strokeWidth="2.5" fill="none" />
    </svg>
  );
}

// ---------- componentes de base ----------

function TopoVerde({ titulo, aoVoltar, acaoDireita, alto, paddingInferior }) {
  const padB = alto ? 90 : paddingInferior !== undefined ? paddingInferior : 30;
  const padding = alto ? `56px 24px ${padB}px` : `22px 20px ${padB}px`;
  return (
    <div style={{ background: COR.verde, padding, position: "relative" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 32 }}>
        {aoVoltar && (
          <button onClick={aoVoltar} aria-label="Voltar" style={{ ...botaoIcone, position: "absolute", left: 0 }}>
            <ArrowLeft size={22} color={COR.iconeEscuro} />
          </button>
        )}
        {titulo && <h1 style={{ fontSize: alto ? 24 : 18, fontWeight: 700, color: COR.iconeEscuro, margin: 0, textAlign: "center", padding: "0 44px" }}>{titulo}</h1>}
        {acaoDireita && <div style={{ position: "absolute", right: 0 }}>{acaoDireita}</div>}
      </div>
    </div>
  );
}

function Painel({ children, semSubir, subida, alturaMinima, semPaddingInferior, preencherTela }) {
  return (
    <div
      className="ef-painel"
      style={{
        background: COR.fundo,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: semSubir ? 0 : subida !== undefined ? subida : -18,
        padding: `26px 20px ${semPaddingInferior ? 26 : 110}px`,
        minHeight: preencherTela ? undefined : alturaMinima !== undefined ? alturaMinima : 420,
        flex: preencherTela ? "1 0 auto" : undefined,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

const botaoIcone = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 4,
  display: "flex",
};

function Campo({ label, value, onChange, placeholder, type = "text", senha, mostrarSenha, aoAlternarSenha, textarea }) {
  const Elemento = textarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: COR.iconeEscuro, display: "block", marginBottom: 6 }}>{label}</label>
      <div className="ef-campo" style={{ position: "relative", borderRadius: textarea ? 18 : 999 }}>
        <Elemento
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "digite..."}
          type={senha && !mostrarSenha ? "password" : type}
          rows={textarea ? 3 : undefined}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: COR.verdeClaro,
            border: "none",
            borderRadius: textarea ? 18 : 999,
            padding: textarea ? "14px 18px" : "14px 18px",
            fontSize: 14,
            color: COR.iconeEscuro,
            outline: "none",
            fontFamily: "inherit",
            resize: "none",
          }}
        />
        {senha && (
          <button onClick={aoAlternarSenha} style={{ ...botaoIcone, position: "absolute", right: 14, top: 12 }} aria-label="Mostrar senha">
            {mostrarSenha ? <EyeOff size={18} color={COR.iconeEscuro} /> : <Eye size={18} color={COR.iconeEscuro} />}
          </button>
        )}
      </div>
    </div>
  );
}

function BotaoPrimario({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={disabled ? "" : "ef-btn"}
      style={{
        width: "100%",
        background: disabled ? COR.verdeClaro : COR.verde,
        color: COR.iconeEscuro,
        border: "none",
        borderRadius: 999,
        padding: "15px",
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function BotaoSecundario({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ef-btn"
      style={{
        width: "100%",
        background: "transparent",
        color: COR.iconeEscuro,
        border: `1.5px solid ${COR.iconeEscuro}`,
        borderRadius: 999,
        padding: "13px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function BotaoClaro({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ef-btn"
      style={{
        width: "100%",
        background: COR.verdeClaro,
        color: COR.iconeEscuro,
        border: "none",
        borderRadius: 999,
        padding: "15px",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function BotaoPerigo({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ef-btn"
      style={{
        background: "transparent",
        color: "#B33A3A",
        border: "none",
        borderRadius: 999,
        padding: "13px 20px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function NavInferior({ ativo, aoNavegar }) {
  const itens = [
    { chave: "home", Icone: Home },
    { chave: "meus-eventos", Icone: CalendarDays },
    { chave: "minhas-inscricoes", Icone: TicketIcon },
    { chave: "perfil", Icone: User },
  ];
  return (
    <div
      className="ef-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: COR.verdeClaro,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        display: "flex",
        justifyContent: "space-around",
        padding: "16px 12px",
        boxSizing: "border-box",
      }}
    >
      {itens.map(({ chave, Icone }) => {
        const ativoAgora = ativo === chave;
        return (
          <button
            key={chave}
            onClick={() => aoNavegar(chave)}
            aria-label={chave}
            className={ativoAgora ? "ef-btn" : ""}
            style={{
              background: ativoAgora ? COR.verde : "transparent",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icone size={20} color={ativoAgora ? COR.branco : COR.iconeEscuro} />
          </button>
        );
      })}
    </div>
  );
}

function Aviso({ texto, tipo = "erro" }) {
  if (!texto) return null;
  return (
    <div
      style={{
        background: tipo === "erro" ? "#FBE4E4" : COR.verdeClaro,
        color: tipo === "erro" ? "#B33A3A" : COR.iconeEscuro,
        borderRadius: 14,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {texto}
    </div>
  );
}

function AbasStatus({ aba, setAba }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      {["Ativos", "Encerrados"].map((op) => (
        <button
          key={op}
          onClick={() => setAba(op)}
          className="ef-btn"
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 999,
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            background: aba === op ? COR.verde : COR.verdeClaro,
            color: COR.iconeEscuro,
          }}
        >
          {op}
        </button>
      ))}
    </div>
  );
}

// ---------- telas ----------

function TelaSplash() {
  return (
    <div style={{ background: COR.verde, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <LogoEventFlow size={64} color={COR.iconeEscuro} />
      <p style={{ fontSize: 30, fontWeight: 800, color: COR.branco, margin: 0 }}>EventFlow</p>
      <Loader size={22} color={COR.iconeEscuro} className="eventflow-girando" />
    </div>
  );
}

const onboardingSlides = [
  { titulo: "Crie Seus Eventos", texto: "Organize e gerencie seus próprios eventos, do início ao fim, direto pelo celular.", Icone: CalendarDays },
  { titulo: "Inscreva-se Em Eventos", texto: "Explore eventos de outras pessoas e participe em poucos toques.", Icone: Search },
  { titulo: "Ticket Vira QR Code", texto: "Mostre seu QR code na entrada e o organizador confirma seu check-in na hora.", Icone: ScanLine },
];

function TelaOnboarding({ irParaAba }) {
  const [passo, setPasso] = useState(0);
  const slide = onboardingSlides[passo];
  const ultimo = passo === onboardingSlides.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ background: COR.verde, padding: "20px 20px", display: "flex", justifyContent: "flex-end", height: 56, boxSizing: "border-box" }}>
        <button onClick={() => irParaAba("inicial")} style={{ background: "none", border: "none", color: COR.iconeEscuro, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Pular
        </button>
      </div>
      <Painel preencherTela>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: COR.verdeClaro, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <slide.Icone size={40} color={COR.iconeEscuro} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: COR.iconeEscuro, margin: "0 0 10px" }}>{slide.titulo}</p>
          <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.75, lineHeight: 1.6, maxWidth: 280, margin: "0 0 30px" }}>{slide.texto}</p>

          <div style={{ display: "flex", gap: 6, marginBottom: 30 }}>
            {onboardingSlides.map((_, i) => (
              <div
                key={i}
                style={{ width: i === passo ? 20 : 8, height: 8, borderRadius: 999, background: i === passo ? COR.verde : COR.verdeClaro }}
              />
            ))}
          </div>

          <div style={{ width: "100%", maxWidth: 280 }}>
            <BotaoPrimario onClick={() => (ultimo ? irParaAba("inicial") : setPasso((p) => p + 1))}>
              {ultimo ? "Começar" : "Próximo"}
            </BotaoPrimario>
          </div>
        </div>
      </Painel>
    </div>
  );
}

function TelaInicial({ ir }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ background: COR.verde, height: 56 }} />
      <Painel preencherTela>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
          <LogoEventFlow size={64} color={COR.verde} />
          <p style={{ fontSize: 34, fontWeight: 800, color: COR.verde, margin: "10px 0 8px" }}>EventFlow</p>
          <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.75, margin: "0 0 34px", lineHeight: 1.5, maxWidth: 280 }}>
            O fluxo perfeito do seu evento, do convite ao encerramento.
          </p>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <BotaoPrimario onClick={() => ir("login")}>Conecte-Se</BotaoPrimario>
            <div style={{ height: 12 }} />
            <BotaoClaro onClick={() => ir("cadastro")}>Inscrever-Se</BotaoClaro>
          </div>
        </div>
      </Painel>
    </div>
  );
}

function TelaLogin({ ir, voltar, acaoLogin }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  function aoConectar() {
    if (!login || !senha) {
      setErro("Preencha usuário e senha.");
      return;
    }
    acaoLogin();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Bem-Vindo" aoVoltar={voltar} alto />
      <Painel preencherTela>
        <Aviso texto={erro} />
        <Campo label="Nome De Usuário" value={login} onChange={setLogin} />
        <Campo label="Senha" value={senha} onChange={setSenha} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <div style={{ textAlign: "right", marginTop: -8 }}>
          <button
            onClick={() => ir("recuperar-senha")}
            style={{ background: "none", border: "none", color: COR.neon, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            Esqueceu sua senha?
          </button>
        </div>
        <div style={{ height: 20 }} />
        <BotaoPrimario onClick={aoConectar}>Conecte-Se</BotaoPrimario>
        <div style={{ height: 12 }} />
        <BotaoClaro onClick={() => ir("cadastro")}>Inscrever-Se</BotaoClaro>
      </Painel>
    </div>
  );
}

function TelaCadastro({ voltar, acaoCadastro }) {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  function aoCriarConta() {
    if (!nome || !usuario || !cpf || !senha) {
      setErro("Preencha nome, usuário, CPF e senha.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    acaoCadastro();
  }

  return (
    <div>
      <TopoVerde titulo="Criar Conta" aoVoltar={voltar} />
      <Painel>
        <Aviso texto={erro} />
        <Campo label="Nome" value={nome} onChange={setNome} />
        <Campo label="Nome De Usuário" value={usuario} onChange={setUsuario} />
        <Campo label="CPF" value={cpf} onChange={setCpf} placeholder="123..." />
        <Campo label="Número De Telefone" value={telefone} onChange={setTelefone} placeholder="123..." />
        <Campo label="Senha" value={senha} onChange={setSenha} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <Campo label="Confirmar Senha" value={confirmar} onChange={setConfirmar} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <div style={{ height: 8 }} />
        <BotaoPrimario onClick={aoCriarConta}>Inscrever-Se</BotaoPrimario>
      </Painel>
    </div>
  );
}

function TelaHome({ ir, meusEventos, minhasInscricoes, eventosExplorar }) {
  const [filtro, setFiltro] = useState("Data");
  const [busca, setBusca] = useState("");

  const filtrados = eventosExplorar.filter((e) => {
    if (!busca) return true;
    const alvo = filtro === "Nome" ? e.nomeEvento : filtro === "Local" ? e.localEvento : e.dataEvento;
    return alvo.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ background: COR.verde, padding: "22px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: COR.iconeEscuro, margin: 0, maxWidth: 260 }}>Olá, {usuarioMock.nome}</p>
          <button
            onClick={() => ir("notificacoes")}
            aria-label="Notificações"
            className="ef-btn"
            style={{ ...botaoIcone, background: COR.branco, borderRadius: "50%", width: 38, height: 38, alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Bell size={18} color={COR.iconeEscuro} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            onClick={() => ir("meus-eventos")}
            className="ef-card"
            style={{ flex: 1, background: "#00A986", border: "none", borderRadius: 20, padding: "14px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <p style={{ fontSize: 12, color: COR.branco, margin: 0, textAlign: "center" }}>Meus Eventos</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: COR.branco, margin: 0, textAlign: "center" }}>{meusEventos.length}</p>
          </button>

          <button
            onClick={() => ir("minhas-inscricoes")}
            className="ef-card"
            style={{ flex: 1, background: COR.verdeClaro, border: "none", borderRadius: 20, padding: "14px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <p style={{ fontSize: 12, color: COR.iconeEscuro, margin: 0, textAlign: "center" }}>Minhas Inscrições</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: COR.iconeEscuro, margin: 0, textAlign: "center" }}>{minhasInscricoes.length}</p>
          </button>
        </div>
      </div>
      <Painel semSubir preencherTela>
        <div
          className="ef-btn"
          style={{
            background: "transparent",
            border: `1.5px solid ${COR.iconeEscuro}`,
            borderRadius: 999,
            padding: "10px 0",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: COR.iconeEscuro }}>
            Explorar Eventos
          </span>
        </div>

        <div style={{ background: COR.verdeClaro, borderRadius: 999, padding: "6px", display: "flex", alignItems: "center", marginBottom: 12 }}>
          <Search size={18} color={COR.iconeEscuro} style={{ marginLeft: 10 }} />
          <input
            value={busca}
            onChange={(e) => setBusca(filtro === "Data" ? mascararData(e.target.value) : e.target.value)}
            placeholder={filtro === "Data" ? "30/04/2026..." : `Buscar por ${filtro.toLowerCase()}...`}
            style={{ flex: 1, border: "none", outline: "none", padding: "8px 10px", fontSize: 13, background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {["Nome", "Local", "Data"].map((op) => (
            <button
              key={op}
              onClick={() => setFiltro(op)}
              className="ef-btn"
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 999,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: filtro === op ? COR.verde : COR.verdeClaro,
                color: COR.iconeEscuro,
              }}
            >
              {op}
            </button>
          ))}
        </div>

        {filtrados.length === 0 && <p style={{ color: COR.iconeEscuro, opacity: 0.6, fontSize: 13 }}>Nenhum evento encontrado.</p>}

        {filtrados.map((ev, i) => (
          <button
            key={ev.idEvento}
            onClick={() => ir("evento-explorar", ev)}
            className="ef-card"
            style={{
              width: "100%",
              background: COR.branco,
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              padding: "14px 12px",
              marginBottom: i < filtrados.length - 1 ? 10 : 0,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: COR.iconeEscuro, textAlign: "left" }}>{ev.nomeEvento}</span>
            <span style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.7, textAlign: "center" }}>{ev.localEvento}</span>
            <span style={{ fontSize: 13, color: COR.neon, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>{ev.hora} — {ev.dataEvento}</span>
          </button>
        ))}
      </Painel>
    </div>
  );
}

function TelaEventoExplorar({ evento, voltar, jaInscrito, acaoInscrever }) {
  const [confirmado, setConfirmado] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo={evento.nomeEvento} aoVoltar={voltar} />
      <Painel preencherTela>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <LinhaInfo Icone={Calendar} texto={`${evento.dataEvento} às ${evento.hora}`} />
          <LinhaInfo Icone={MapPin} texto={evento.localEvento} />
          <LinhaInfo Icone={UsersIcon} texto={`${evento.vagasDisponiveisEvento} de ${evento.vagasTotaisEvento} vagas disponíveis`} />
        </div>
        <p style={{ fontSize: 14, color: COR.iconeEscuro, lineHeight: 1.6 }}>{evento.descricaoEvento}</p>

        {confirmado || jaInscrito ? (
          <Aviso texto="Você já está inscrito neste evento. Confira seu ticket em Minhas Inscrições." tipo="ok" />
        ) : evento.vagasDisponiveisEvento <= 0 ? (
          <Aviso texto="Não há mais vagas disponíveis para este evento." />
        ) : (
          <div style={{ marginTop: 24 }}>
            <BotaoPrimario
              onClick={() => {
                acaoInscrever(evento);
                setConfirmado(true);
              }}
            >
              Inscrever-Se
            </BotaoPrimario>
          </div>
        )}
      </Painel>
    </div>
  );
}

function LinhaInfo({ Icone, texto }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icone size={16} color={COR.iconeEscuro} />
      <span style={{ fontSize: 14, color: COR.iconeEscuro }}>{texto}</span>
    </div>
  );
}

function TelaMeusEventos({ ir, meusEventos, eventosExplorar, perfilAtual }) {
  const [aba, setAba] = useState("Ativos");

  // No modo ADMIN, "Meus Eventos" mostra todo evento do sistema, não só os que o
  // usuário logado organizou — é exatamente o que o backend já permite (ADMIN ignora
  // a checagem de dono nos endpoints de evento). Junta as duas listas mock e remove
  // duplicata (um evento pode aparecer nas duas se o próprio admin também o organizou).
  const listaBase =
    perfilAtual === "ADMIN"
      ? [...meusEventos, ...eventosExplorar.filter((e) => !meusEventos.some((m) => m.idEvento === e.idEvento))]
      : meusEventos;

  const filtrados = listaBase.filter((ev) => (aba === "Ativos" ? !ev.encerrado : ev.encerrado));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde
        titulo="Meus Eventos"
        acaoDireita={
          <button onClick={() => ir("cadastrar-evento")} aria-label="Criar evento" className="ef-btn" style={{ ...botaoIcone, background: COR.branco, borderRadius: "50%", width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
            <Plus size={20} color={COR.iconeEscuro} />
          </button>
        }
      />
      <Painel preencherTela>
        {perfilAtual === "ADMIN" && (
          <div style={{ display: "inline-block", background: COR.iconeEscuro, color: COR.branco, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, marginBottom: 14 }}>
            Modo Administrador — exibindo eventos de todos os organizadores
          </div>
        )}
        <AbasStatus aba={aba} setAba={setAba} />
        {filtrados.length === 0 && (
          <p style={{ color: COR.iconeEscuro, opacity: 0.6, fontSize: 13 }}>
            {aba === "Ativos" ? "Você ainda não criou nenhum evento ativo. Toque no + para começar." : "Nenhum evento encerrado ainda."}
          </p>
        )}
        {filtrados.map((ev, i) => (
          <button
            key={ev.idEvento}
            onClick={() => ir("evento-gerenciar", ev)}
            className="ef-card"
            style={{
              width: "100%",
              background: COR.branco,
              border: "none",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              padding: "14px 12px",
              marginBottom: i < filtrados.length - 1 ? 10 : 0,
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              opacity: ev.encerrado ? 0.6 : 1,
            }}
          >
            <div className="ef-avatar" style={{ width: 42, height: 42, borderRadius: 12, background: COR.verde, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={20} color={COR.iconeEscuro} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: COR.iconeEscuro, margin: 0 }}>{ev.nomeEvento}</p>
              <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.7, margin: "2px 0" }}>{ev.descricaoEvento}</p>
              {perfilAtual === "ADMIN" && ev.organizador && ev.organizador !== usuarioMock.nome && (
                <p style={{ fontSize: 11, color: COR.iconeEscuro, opacity: 0.55, margin: "0 0 2px" }}>Organizado por {ev.organizador}</p>
              )}
              <p style={{ fontSize: 12, color: COR.neon, fontWeight: 600, margin: 0 }}>{ev.hora} — {ev.dataEvento}</p>
            </div>
          </button>
        ))}
      </Painel>
    </div>
  );
}

function TelaCadastrarEvento({ voltar, acaoCriar }) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [vagas, setVagas] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  function aoSalvar() {
    if (!nome || !data || !local || !vagas) {
      setErro("Preencha nome, data, local e vagas totais.");
      return;
    }
    acaoCriar({ nomeEvento: nome, dataEvento: data, localEvento: local, vagasTotaisEvento: Number(vagas), descricaoEvento: descricao });
  }

  return (
    <div>
      <TopoVerde titulo="Cadastrar Evento" aoVoltar={voltar} paddingInferior={72} />
      <Painel>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -65, marginBottom: 20 }}>
          <div className="ef-avatar" style={{ width: 78, height: 78, borderRadius: "50%", background: COR.iconeEscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarDays size={30} color={COR.branco} />
          </div>
        </div>
        <Aviso texto={erro} />
        <Campo label="Nome" value={nome} onChange={setNome} />
        <Campo label="Data" value={data} onChange={setData} placeholder="DD/MM/AAAA" />
        <Campo label="Local" value={local} onChange={setLocal} />
        <Campo label="Vagas Totais" value={vagas} onChange={setVagas} type="number" />
        <Campo label="Descrição" value={descricao} onChange={setDescricao} textarea />
        <div style={{ height: 8 }} />
        <BotaoPrimario onClick={aoSalvar}>Criar Evento</BotaoPrimario>
      </Painel>
    </div>
  );
}

function TelaEditarEvento({ evento, voltar, acaoAtualizar, acaoInativar }) {
  const [nome, setNome] = useState(evento.nomeEvento);
  const [data, setData] = useState(evento.dataEvento);
  const [local, setLocal] = useState(evento.localEvento);
  const [vagas, setVagas] = useState(String(evento.vagasTotaisEvento));
  const [descricao, setDescricao] = useState(evento.descricaoEvento);

  return (
    <div>
      <TopoVerde titulo="Editar Evento" aoVoltar={voltar} paddingInferior={72} />
      <Painel>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -65, marginBottom: 18 }}>
          <div className="ef-avatar" style={{ width: 78, height: 78, borderRadius: "50%", background: COR.iconeEscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarDays size={30} color={COR.branco} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 17, color: COR.iconeEscuro, marginTop: 10 }}>{evento.nomeEvento}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: COR.iconeEscuro, margin: "0 0 14px" }}>Informações Do Evento</p>
        <Campo label="Nome" value={nome} onChange={setNome} />
        <Campo label="Data" value={data} onChange={setData} />
        <Campo label="Local" value={local} onChange={setLocal} />
        <Campo label="Vagas Totais" value={vagas} onChange={setVagas} type="number" />
        <Campo label="Descrição" value={descricao} onChange={setDescricao} textarea />
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <div style={{ flex: 1 }}>
            <BotaoPrimario onClick={() => acaoAtualizar({ nomeEvento: nome, dataEvento: data, localEvento: local, vagasTotaisEvento: Number(vagas), descricaoEvento: descricao })}>
              Atualizar Evento
            </BotaoPrimario>
          </div>
          <div style={{ flex: 1 }}>
            <BotaoSecundario onClick={acaoInativar}>Inativar Evento</BotaoSecundario>
          </div>
        </div>
      </Painel>
    </div>
  );
}

function TelaGerenciarEvento({ evento, ir, voltar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde
        titulo={evento.nomeEvento}
        aoVoltar={voltar}
        acaoDireita={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => ir("convidar", evento)} aria-label="Convidar participantes" className="ef-btn" style={{ ...botaoIcone, background: COR.branco, borderRadius: "50%", width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <Share2 size={18} color={COR.iconeEscuro} />
            </button>
            <button onClick={() => ir("leitor-qr", evento)} aria-label="Escanear ticket" className="ef-btn" style={{ ...botaoIcone, background: COR.branco, borderRadius: "50%", width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <ScanLine size={18} color={COR.iconeEscuro} />
            </button>
            <button onClick={() => ir("editar-evento", evento)} aria-label="Editar evento" className="ef-btn" style={{ ...botaoIcone, background: COR.branco, borderRadius: "50%", width: 38, height: 38, alignItems: "center", justifyContent: "center" }}>
              <MoreVertical size={18} color={COR.iconeEscuro} />
            </button>
          </div>
        }
      />
      <div style={{ background: COR.verde, padding: "0 20px 40px", marginTop: -30 }}>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, margin: "4px 0" }}><b>Data:</b> {evento.dataEvento}</p>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, margin: "4px 0" }}><b>Local:</b> {evento.localEvento}</p>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, margin: "4px 0" }}><b>Vagas Totais/Disponíveis:</b> {evento.vagasTotaisEvento}/{evento.vagasDisponiveisEvento}</p>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, margin: "4px 0" }}><b>Descrição:</b> {evento.descricaoEvento}</p>
      </div>
      <Painel semSubir preencherTela>
        <p style={{ fontWeight: 700, fontSize: 17, color: COR.iconeEscuro, textAlign: "center", margin: "0 0 18px" }}>Participantes</p>
        {evento.participantes.length === 0 && <p style={{ color: COR.iconeEscuro, opacity: 0.6, fontSize: 13, textAlign: "center" }}>Ninguém se inscreveu neste evento ainda.</p>}
        {evento.participantes.map((p, i) => (
          <button
            key={p.idUsuario}
            onClick={() => ir("participante", { evento, participante: p })}
            className="ef-card"
            style={{
              width: "100%",
              background: COR.branco,
              border: "none",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              padding: "12px 12px",
              marginBottom: i < evento.participantes.length - 1 ? 10 : 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div className="ef-avatar" style={{ width: 36, height: 36, borderRadius: "50%", background: COR.verde, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={18} color={COR.iconeEscuro} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: COR.iconeEscuro, margin: 0 }}>{p.nome}.</p>
              <p style={{ fontSize: 12, color: p.checkin ? "#1E8E5A" : COR.iconeEscuro, opacity: p.checkin ? 1 : 0.6, margin: 0 }}>
                {p.checkin ? "Check-in realizado." : "Check-in não realizado."}
              </p>
            </div>
          </button>
        ))}
      </Painel>
    </div>
  );
}

function TelaParticipante({ evento, participante, voltar, acaoCancelar }) {
  const [cancelado, setCancelado] = useState(false);

  return (
    <div>
      <TopoVerde titulo="Detalhes Do Usuário" aoVoltar={voltar} paddingInferior={72} />
      <Painel>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -65, marginBottom: 22 }}>
          <div className="ef-avatar" style={{ width: 78, height: 78, borderRadius: "50%", background: COR.iconeEscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={34} color={COR.branco} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 17, color: COR.iconeEscuro, marginTop: 10 }}>{participante.nome}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: COR.iconeEscuro, margin: "0 0 14px" }}>Informações Do Usuário</p>
        <CampoSomenteLeitura label="Nome" valor={`${participante.nome}.`} />
        <CampoSomenteLeitura label="Nome De Usuário" valor={`${participante.login}.`} />
        <CampoSomenteLeitura label="Telefone" valor={`${participante.telefone}.`} />

        {cancelado ? (
          <Aviso texto="Inscrição cancelada. A vaga voltou a ficar disponível no evento." tipo="ok" />
        ) : (
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <BotaoPerigo
              onClick={() => {
                acaoCancelar(evento, participante);
                setCancelado(true);
              }}
            >
              Cancelar Inscrição
            </BotaoPerigo>
          </div>
        )}
      </Painel>
    </div>
  );
}

function CampoSomenteLeitura({ label, valor }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: COR.iconeEscuro, margin: "0 0 6px" }}>{label}</p>
      <div style={{ background: COR.verdeClaro, borderRadius: 999, padding: "14px 18px", fontSize: 14, color: COR.iconeEscuro }}>{valor}</div>
    </div>
  );
}

function TelaLeitorQR({ evento, voltar, acaoConfirmarCheckin }) {
  const [resultado, setResultado] = useState(null);

  const pendente = evento.participantes.find((p) => !p.checkin);

  function simularLeitura() {
    if (!pendente) {
      setResultado({ ok: false, texto: "Não há participantes pendentes de check-in neste evento." });
      return;
    }
    acaoConfirmarCheckin(evento, pendente);
    setResultado({ ok: true, nome: pendente.nome });
  }

  if (resultado && resultado.ok) {
    return (
      <div style={{ background: COR.verde, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 32px", textAlign: "center" }}>
        <div style={{ width: 78, height: 78, borderRadius: "50%", border: `3px solid ${COR.branco}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={40} color={COR.branco} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: COR.branco, margin: 0 }}>Check-in Confirmado!</p>
        <p style={{ fontSize: 14, color: COR.branco, opacity: 0.9, margin: 0 }}>{resultado.nome}</p>
        <div style={{ height: 10 }} />
        <div style={{ width: "100%", maxWidth: 280 }}>
          <BotaoClaro onClick={() => setResultado(null)}>Escanear Outro</BotaoClaro>
        </div>
        <button onClick={voltar} style={{ background: "none", border: "none", color: COR.branco, fontSize: 13, fontWeight: 700, marginTop: 4, cursor: "pointer", textDecoration: "underline" }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div>
      <TopoVerde titulo="Leitor De QR Code" aoVoltar={voltar} />
      <div style={{ background: COR.verde, padding: "10px 20px 50px" }}>
        <div
          style={{
            border: `2px solid ${COR.iconeEscuro}`,
            borderRadius: 28,
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "20px 0",
          }}
        >
          <ScanLine size={40} color={COR.iconeEscuro} style={{ opacity: 0.5 }} />
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: COR.iconeEscuro, opacity: 0.85 }}>
          Aponte a câmera para o QR code do ticket do participante.
        </p>
      </div>
      <Painel semSubir>
        {resultado && !resultado.ok && <Aviso texto={resultado.texto} tipo="erro" />}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <BotaoPrimario onClick={simularLeitura}>Simular Leitura</BotaoPrimario>
        </div>
        <p style={{ fontSize: 12, color: COR.iconeEscuro, opacity: 0.5, textAlign: "center", marginTop: 14 }}>
          Protótipo: a leitura real de câmera entra quando conectarmos com o dispositivo.
        </p>
      </Painel>
    </div>
  );
}

function TelaMinhasInscricoes({ ir, minhasInscricoes }) {
  const [aba, setAba] = useState("Ativos");
  const filtrados = minhasInscricoes.filter((insc) => (aba === "Ativos" ? !insc.encerrado : insc.encerrado));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Minhas Inscrições" />
      <Painel preencherTela>
        <AbasStatus aba={aba} setAba={setAba} />
        {filtrados.length === 0 && (
          <p style={{ color: COR.iconeEscuro, opacity: 0.6, fontSize: 13 }}>
            {aba === "Ativos" ? "Você ainda não se inscreveu em nenhum evento. Toque em Explorar Eventos na Home." : "Nenhuma inscrição encerrada ainda."}
          </p>
        )}
        {filtrados.map((insc, i) => (
          <button
            key={insc.idInscricao}
            onClick={() => ir("ticket", insc)}
            className="ef-card"
            style={{
              width: "100%",
              background: COR.branco,
              border: "none",
              borderRadius: 16,
              textAlign: "left",
              cursor: "pointer",
              padding: "14px 12px",
              marginBottom: i < filtrados.length - 1 ? 10 : 0,
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: insc.encerrado ? 0.6 : 1,
            }}
          >
            <div className="ef-avatar" style={{ width: 42, height: 42, borderRadius: 12, background: COR.verde, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TicketIcon size={20} color={COR.iconeEscuro} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: COR.iconeEscuro, margin: 0 }}>{insc.nomeEvento}</p>
              <p style={{ fontSize: 12, color: COR.iconeEscuro, opacity: 0.7, margin: 0 }}>{insc.localEvento}</p>
            </div>
            <span style={{ fontSize: 12, color: COR.neon, fontWeight: 600 }}>{insc.hora} — {insc.dataEvento}</span>
          </button>
        ))}
      </Painel>
    </div>
  );
}

function TelaTicket({ inscricao, voltar, acaoCancelar }) {
  const [cancelado, setCancelado] = useState(false);

  return (
    <div>
      <TopoVerde titulo="Seu Ticket" aoVoltar={voltar} />
      <Painel>
        <p style={{ fontWeight: 700, fontSize: 18, color: COR.iconeEscuro, textAlign: "center", margin: "4px 0 4px" }}>{inscricao.nomeEvento}</p>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.7, textAlign: "center", margin: "0 0 20px" }}>
          {inscricao.localEvento} • {inscricao.hora} — {inscricao.dataEvento}
        </p>

        <div
          style={{
            background: COR.branco,
            borderRadius: 24,
            padding: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <QrPlaceholder />
        </div>

        <p style={{ fontSize: 11, color: COR.iconeEscuro, opacity: 0.5, textAlign: "center", wordBreak: "break-all" }}>
          {inscricao.codigoHashTicket}
        </p>
        <p style={{ fontSize: 12, color: COR.iconeEscuro, opacity: 0.6, textAlign: "center", marginTop: 10, marginBottom: 24 }}>
          Mostre esse QR code pro organizador na entrada do evento.
        </p>

        <p style={{ fontWeight: 700, fontSize: 15, color: COR.iconeEscuro, margin: "0 0 12px" }}>Detalhes Do Evento</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <LinhaInfo Icone={Calendar} texto={`${inscricao.dataEvento} às ${inscricao.hora}`} />
          <LinhaInfo Icone={MapPin} texto={inscricao.localEvento} />
          {inscricao.organizador && <LinhaInfo Icone={UsersIcon} texto={`Organizado por ${inscricao.organizador}`} />}
        </div>
        {inscricao.descricaoEvento && <p style={{ fontSize: 14, color: COR.iconeEscuro, lineHeight: 1.6, marginBottom: 20 }}>{inscricao.descricaoEvento}</p>}

        {cancelado ? (
          <Aviso texto="Inscrição cancelada." tipo="ok" />
        ) : (
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <BotaoPerigo
              onClick={() => {
                acaoCancelar(inscricao);
                setCancelado(true);
              }}
            >
              Cancelar Inscrição
            </BotaoPerigo>
          </div>
        )}
      </Painel>
    </div>
  );
}

// Representação visual de um QR code (não é um QR de verdade). O QR real vem do
// backend em GET /ticket/detalhar/{id}/qrcode como imagem PNG — aqui é só pra
// a tela não ficar vazia enquanto o frontend não está ligado na API.
function QrPlaceholder() {
  const linhas = 9;
  const semente = 42;
  let x = semente;
  function proximo() {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x % 2 === 0;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${linhas}, 1fr)`, gap: 3, width: 176, height: 176 }}>
      {Array.from({ length: linhas * linhas }).map((_, i) => (
        <div key={i} style={{ background: proximo() ? COR.iconeEscuro : "transparent", borderRadius: 1 }} />
      ))}
    </div>
  );
}

function TelaPerfil({ sair, ir, perfilAtual, setPerfilAtual }) {
  const [nome, setNome] = useState(usuarioMock.nome);
  const [login, setLogin] = useState(usuarioMock.login);
  const [telefone, setTelefone] = useState(usuarioMock.telefone);
  const [cpf, setCpf] = useState(usuarioMock.cpf);
  const [salvo, setSalvo] = useState(false);

  function aoAtualizar() {
    // PUT /usuario/atualizar (endpoint ainda não existe no backend)
    usuarioMock.nome = nome;
    usuarioMock.login = login;
    usuarioMock.telefone = telefone;
    setSalvo(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Editar Meu Perfil" paddingInferior={72} />
      <Painel preencherTela>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -65, marginBottom: 22 }}>
          <div className="ef-avatar" style={{ width: 78, height: 78, borderRadius: "50%", background: COR.iconeEscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={34} color={COR.branco} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 17, color: COR.iconeEscuro, marginTop: 10 }}>{nome}</p>
        </div>

        <p style={{ fontWeight: 700, fontSize: 15, color: COR.iconeEscuro, margin: "0 0 14px" }}>Informações Do Usuário</p>
        {salvo && <Aviso texto="Perfil atualizado." tipo="ok" />}
        <Campo label="Nome" value={nome} onChange={setNome} />
        <Campo label="Nome De Usuário" value={login} onChange={setLogin} />
        <Campo label="Telefone" value={telefone} onChange={setTelefone} />
        <CampoSomenteLeitura label="CPF" valor={cpf} />

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <div style={{ flex: 1 }}>
            <BotaoPrimario onClick={aoAtualizar}>Atualizar Perfil</BotaoPrimario>
          </div>
          <div style={{ flex: 1 }}>
            <BotaoSecundario onClick={() => ir("alterar-senha")}>Editar Senha</BotaoSecundario>
          </div>
        </div>

        {/* Isso não existe num app de verdade — lá o perfil (ADMIN/USER) vem do próprio
            token JWT de quem fez login, ninguém escolhe. É só um controle de demonstração
            pra você conseguir ver as duas experiências (usuário comum e administrador)
            sem precisar simular dois logins diferentes. Remover quando conectar a API real. */}
        <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(5,34,36,0.12)" }}>
          <p style={{ fontSize: 11, color: COR.iconeEscuro, opacity: 0.55, margin: "0 0 8px" }}>
            Simular perfil (protótipo) — num app real isso vem do login, não é uma escolha
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {["USER", "ADMIN"].map((p) => (
              <button
                key={p}
                onClick={() => setPerfilAtual(p)}
                className="ef-btn"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: perfilAtual === p ? COR.verde : COR.verdeClaro,
                  color: COR.iconeEscuro,
                }}
              >
                {p === "USER" ? "Usuário" : "Administrador"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            onClick={sair}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px",
              color: "#B33A3A",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <LogOut size={17} /> Sair
          </button>
        </div>

        {/* Link só pra você conseguir ver a tela de erro no protótipo — não existe
            uma condição real de falha ainda, já que tudo aqui é mock. Remover quando
            conectarmos com a API de verdade (aí sim ela dispara sozinha em falha de fetch). */}
        <button
          onClick={() => ir("erro")}
          style={{ width: "100%", background: "none", border: "none", color: COR.iconeEscuro, opacity: 0.4, fontSize: 11, marginTop: 10, cursor: "pointer" }}
        >
          Ver tela de erro (protótipo)
        </button>
      </Painel>
    </div>
  );
}

function TelaAlterarSenha({ voltar }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function aoAlterar() {
    // PUT /usuario/alterar-senha (endpoint ainda não existe no backend)
    if (!senhaAtual || !novaSenha) {
      setErro("Preencha a senha atual e a nova senha.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    setSucesso(true);
  }

  if (sucesso) {
    return (
      <div style={{ background: COR.verde, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", textAlign: "center" }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", border: `3px solid ${COR.branco}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COR.branco }} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: COR.branco, margin: 0, lineHeight: 1.5 }}>A Senha Foi Alterada Com Sucesso.</p>
        <div style={{ height: 8 }} />
        <BotaoClaro onClick={voltar}>Voltar</BotaoClaro>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Alterar Senha" aoVoltar={voltar} />
      <Painel preencherTela>
        <Aviso texto={erro} />
        <Campo label="Senha Atual" value={senhaAtual} onChange={setSenhaAtual} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <Campo label="Nova Senha" value={novaSenha} onChange={setNovaSenha} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <Campo label="Confirmar Senha" value={confirmar} onChange={setConfirmar} senha mostrarSenha={mostrarSenha} aoAlternarSenha={() => setMostrarSenha((v) => !v)} />
        <div style={{ height: 8 }} />
        <BotaoPrimario onClick={aoAlterar}>Alterar Senha</BotaoPrimario>
      </Painel>
    </div>
  );
}

function TelaRecuperarSenha({ voltar }) {
  const [login, setLogin] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function aoEnviar() {
    // POST /usuario/recuperar-senha (endpoint ainda não existe no backend)
    if (!login) {
      setErro("Digite seu nome de usuário.");
      return;
    }
    setErro("");
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div style={{ background: COR.verde, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", textAlign: "center" }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", border: `3px solid ${COR.branco}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COR.branco }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: COR.branco, margin: 0, lineHeight: 1.6 }}>
          Se encontrarmos uma conta com esse nome de usuário, enviaremos instruções para redefinir sua senha.
        </p>
        <div style={{ height: 8 }} />
        <div style={{ width: "100%", maxWidth: 280 }}>
          <BotaoClaro onClick={voltar}>Voltar Para O Login</BotaoClaro>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Recuperar Senha" aoVoltar={voltar} />
      <Painel preencherTela>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.75, lineHeight: 1.6, marginBottom: 22 }}>
          Digite o nome de usuário da sua conta. Se ele existir, enviaremos instruções para você redefinir sua senha.
        </p>
        <Aviso texto={erro} />
        <Campo label="Nome De Usuário" value={login} onChange={setLogin} />
        <div style={{ height: 8 }} />
        <BotaoPrimario onClick={aoEnviar}>Enviar</BotaoPrimario>
      </Painel>
    </div>
  );
}

// Tela genérica de erro — não é acionada em nenhum lugar do protótipo ainda (não há
// chamadas de API de verdade pra falhar), mas fica pronta pra usar quando conectarmos
// com o backend: qualquer fetch() que falhar pode renderizar essa tela no lugar do conteúdo normal.
function TelaErro({ voltar, tentar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Ops" />
      <Painel preencherTela>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 14 }}>
          <div className="ef-avatar" style={{ width: 74, height: 74, borderRadius: "50%", background: COR.verdeClaro, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TriangleAlert size={32} color={COR.iconeEscuro} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: COR.iconeEscuro, margin: 0 }}>Algo Deu Errado</p>
          <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.7, lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            Não conseguimos completar essa ação. Verifique sua conexão e tente novamente.
          </p>
          <div style={{ height: 8 }} />
          <div style={{ width: "100%", maxWidth: 280 }}>
            {tentar && (
              <>
                <BotaoPrimario onClick={tentar}>Tentar Novamente</BotaoPrimario>
                <div style={{ height: 10 }} />
              </>
            )}
            <BotaoClaro onClick={voltar}>Voltar Para O Início</BotaoClaro>
          </div>
        </div>
      </Painel>
    </div>
  );
}

function TelaNotificacoes({ voltar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Notificação" aoVoltar={voltar} />
      <Painel preencherTela>
        {notificacoesMock.length === 0 && <p style={{ color: COR.iconeEscuro, opacity: 0.6, fontSize: 13 }}>Nenhuma notificação por enquanto.</p>}
        {notificacoesMock.map((n, i) => (
          <div
            key={n.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px 0",
              borderBottom: i < notificacoesMock.length - 1 ? "1px solid rgba(5,34,36,0.12)" : "none",
            }}
          >
            <div className="ef-avatar" style={{ width: 38, height: 38, borderRadius: 10, background: COR.verde, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {n.tipo === "participante" ? <UsersIcon size={18} color={COR.iconeEscuro} /> : <CalendarDays size={18} color={COR.iconeEscuro} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: COR.iconeEscuro, margin: 0 }}>{n.titulo}</p>
              <p style={{ fontSize: 12, color: COR.iconeEscuro, opacity: 0.7, margin: "2px 0" }}>{n.texto}</p>
              <p style={{ fontSize: 11, color: COR.neon, fontWeight: 600, margin: 0 }}>{n.quando}</p>
            </div>
          </div>
        ))}
      </Painel>
    </div>
  );
}

function TelaConvidar({ evento, voltar }) {
  const [copiado, setCopiado] = useState(false);
  const link = `https://eventflow.app/evento/${evento.idEvento}`;

  function aoCopiar() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopiado(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopoVerde titulo="Convidar Participantes" aoVoltar={voltar} />
      <Painel preencherTela>
        <p style={{ fontSize: 13, color: COR.iconeEscuro, opacity: 0.75, lineHeight: 1.6, marginBottom: 20 }}>
          Compartilhe esse link com quem você quiser convidar pro <b>{evento.nomeEvento}</b>. Qualquer pessoa com uma conta pode se inscrever direto por ele.
        </p>
        <div style={{ background: COR.verdeClaro, borderRadius: 16, padding: "14px 16px", fontSize: 13, color: COR.iconeEscuro, wordBreak: "break-all", marginBottom: 16 }}>
          {link}
        </div>
        {copiado && <Aviso texto="Link copiado!" tipo="ok" />}
        <BotaoPrimario onClick={aoCopiar}>Copiar Link</BotaoPrimario>
      </Painel>
    </div>
  );
}

// ---------- app ----------

export default function GerenciadorEventosApp() {
  const [logado, setLogado] = useState(false);
  // Simula o campo "perfil" do backend (Usuario.perfil: ADMIN ou USER). Num login de
  // verdade isso viria do token JWT — aqui é só um controle de demonstração, trocável
  // na tela de Perfil, pra dar pra ver as duas experiências sem precisar de dois logins.
  const [perfilAtual, setPerfilAtual] = useState("USER");
  const [pilha, setPilha] = useState([{ nome: "splash" }]);
  const [meusEventos, setMeusEventos] = useState(meusEventosIniciais);
  const [eventosExplorar, setEventosExplorar] = useState(eventosExplorarIniciais);
  const [minhasInscricoes, setMinhasInscricoes] = useState(minhasInscricoesIniciais);

  useEffect(() => {
    const timer = setTimeout(() => setPilha([{ nome: "onboarding" }]), 1400);
    return () => clearTimeout(timer);
  }, []);

  const atual = pilha[pilha.length - 1];

  function ir(nome, dados) {
    setPilha((p) => [...p, { nome, dados }]);
  }
  function voltar() {
    setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }
  function irParaAba(chave) {
    setPilha([{ nome: chave }]);
  }

  // --- ações mock (aqui é onde entram as chamadas fetch() de verdade depois) ---

  function acaoLogin() {
    // POST /login -> guarda o token JWT retornado e chama GET /usuario/me (se existir) ou decodifica o token
    setLogado(true);
    irParaAba("home");
  }

  function acaoCadastro() {
    // POST /usuario/cadastrar -> depois disso, leva pro login
    voltar();
  }

  function acaoInscrever(evento) {
    // POST /inscricao/cadastrar { idEvento, dataInscricao }
    setEventosExplorar((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, vagasDisponiveisEvento: e.vagasDisponiveisEvento - 1 } : e)));
    setMinhasInscricoes((lista) => [
      ...lista,
      {
        idInscricao: Date.now(),
        idEvento: evento.idEvento,
        nomeEvento: evento.nomeEvento,
        localEvento: evento.localEvento,
        dataEvento: evento.dataEvento,
        hora: evento.hora,
        descricaoEvento: evento.descricaoEvento,
        organizador: evento.organizador,
        codigoHashTicket: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
      },
    ]);
  }

  function acaoCriarEvento(dados) {
    // POST /evento/cadastrar { nomeEvento, descricaoEvento, dataEvento, localEvento, vagasTotaisEvento, vagasDisponiveisEvento }
    const novo = { idEvento: Date.now(), statusGeral: "ATIVO", vagasDisponiveisEvento: dados.vagasTotaisEvento, participantes: [], hora: "—", ...dados };
    setMeusEventos((lista) => [novo, ...lista]);
    voltar();
  }

  function acaoAtualizarEvento(evento, dados) {
    // PUT /evento/atualizar { idEvento, ... }
    setMeusEventos((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, ...dados } : e)));
    setEventosExplorar((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, ...dados } : e)));
    voltar();
    voltar();
  }

  function acaoInativarEvento(evento) {
    // DELETE /evento/inativar/{id}
    setMeusEventos((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, statusGeral: "INATIVO" } : e)));
    setEventosExplorar((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, statusGeral: "INATIVO" } : e)));
    irParaAba("meus-eventos");
  }

  function acaoCancelarInscricao(evento, participante) {
    // DELETE /inscricao/inativar/{id} (chamado pelo organizador do evento, ou por um ADMIN em qualquer evento)
    setMeusEventos((lista) =>
      lista.map((e) =>
        e.idEvento === evento.idEvento
          ? { ...e, vagasDisponiveisEvento: e.vagasDisponiveisEvento + 1, participantes: e.participantes.filter((p) => p.idUsuario !== participante.idUsuario) }
          : e
      )
    );
    setEventosExplorar((lista) => lista.map((e) => (e.idEvento === evento.idEvento ? { ...e, vagasDisponiveisEvento: e.vagasDisponiveisEvento + 1 } : e)));
  }

  function acaoConfirmarCheckin(evento, participante) {
    // POST /checkin/escanear { codigoHashTicket }
    setMeusEventos((lista) =>
      lista.map((e) =>
        e.idEvento === evento.idEvento
          ? { ...e, participantes: e.participantes.map((p) => (p.idUsuario === participante.idUsuario ? { ...p, checkin: true } : p)) }
          : e
      )
    );
  }

  function acaoCancelarMinhaInscricao(inscricao) {
    // DELETE /inscricao/inativar/{id} (chamado pelo próprio participante, na tela do ticket)
    setMinhasInscricoes((lista) => lista.filter((i) => i.idInscricao !== inscricao.idInscricao));
    setEventosExplorar((lista) => lista.map((e) => (e.idEvento === inscricao.idEvento ? { ...e, vagasDisponiveisEvento: e.vagasDisponiveisEvento + 1 } : e)));
  }

  function sair() {
    setLogado(false);
    setPilha([{ nome: "inicial" }]);
  }

  let conteudo;
  if (!logado) {
    if (atual.nome === "splash") {
      conteudo = <TelaSplash />;
    } else if (atual.nome === "onboarding") {
      conteudo = <TelaOnboarding irParaAba={irParaAba} />;
    } else if (atual.nome === "cadastro") {
      conteudo = <TelaCadastro voltar={voltar} acaoCadastro={acaoCadastro} />;
    } else if (atual.nome === "login") {
      conteudo = <TelaLogin ir={ir} voltar={voltar} acaoLogin={acaoLogin} />;
    } else if (atual.nome === "recuperar-senha") {
      conteudo = <TelaRecuperarSenha voltar={voltar} />;
    } else {
      conteudo = <TelaInicial ir={ir} />;
    }
  } else if (atual.nome === "home") {
    conteudo = <TelaHome ir={ir} meusEventos={meusEventos} minhasInscricoes={minhasInscricoes} eventosExplorar={eventosExplorar} />;
  } else if (atual.nome === "evento-explorar") {
    const evento = eventosExplorar.find((e) => e.idEvento === atual.dados.idEvento) || atual.dados;
    const inscrito = minhasInscricoes.some((i) => i.idEvento === evento.idEvento);
    conteudo = <TelaEventoExplorar evento={evento} voltar={voltar} jaInscrito={inscrito} acaoInscrever={acaoInscrever} />;
  } else if (atual.nome === "meus-eventos") {
    conteudo = <TelaMeusEventos ir={ir} meusEventos={meusEventos} eventosExplorar={eventosExplorar} perfilAtual={perfilAtual} />;
  } else if (atual.nome === "cadastrar-evento") {
    conteudo = <TelaCadastrarEvento voltar={voltar} acaoCriar={acaoCriarEvento} />;
  } else if (atual.nome === "editar-evento") {
    const evento = meusEventos.find((e) => e.idEvento === atual.dados.idEvento) || atual.dados;
    conteudo = <TelaEditarEvento evento={evento} voltar={voltar} acaoAtualizar={(d) => acaoAtualizarEvento(evento, d)} acaoInativar={() => acaoInativarEvento(evento)} />;
  } else if (atual.nome === "evento-gerenciar") {
    const evento = meusEventos.find((e) => e.idEvento === atual.dados.idEvento) || atual.dados;
    conteudo = <TelaGerenciarEvento evento={evento} ir={ir} voltar={voltar} />;
  } else if (atual.nome === "participante") {
    const evento = meusEventos.find((e) => e.idEvento === atual.dados.evento.idEvento) || atual.dados.evento;
    conteudo = <TelaParticipante evento={evento} participante={atual.dados.participante} voltar={voltar} acaoCancelar={acaoCancelarInscricao} />;
  } else if (atual.nome === "leitor-qr") {
    const evento = meusEventos.find((e) => e.idEvento === atual.dados.idEvento) || atual.dados;
    conteudo = <TelaLeitorQR evento={evento} voltar={voltar} acaoConfirmarCheckin={acaoConfirmarCheckin} />;
  } else if (atual.nome === "minhas-inscricoes") {
    conteudo = <TelaMinhasInscricoes ir={ir} minhasInscricoes={minhasInscricoes} />;
  } else if (atual.nome === "ticket") {
    conteudo = <TelaTicket inscricao={atual.dados} voltar={voltar} acaoCancelar={acaoCancelarMinhaInscricao} />;
  } else if (atual.nome === "perfil") {
    conteudo = <TelaPerfil sair={sair} ir={ir} perfilAtual={perfilAtual} setPerfilAtual={setPerfilAtual} />;
  } else if (atual.nome === "alterar-senha") {
    conteudo = <TelaAlterarSenha voltar={voltar} />;
  } else if (atual.nome === "notificacoes") {
    conteudo = <TelaNotificacoes voltar={voltar} />;
  } else if (atual.nome === "convidar") {
    const evento = meusEventos.find((e) => e.idEvento === atual.dados.idEvento) || atual.dados;
    conteudo = <TelaConvidar evento={evento} voltar={voltar} />;
  } else if (atual.nome === "erro") {
    conteudo = <TelaErro voltar={() => irParaAba("home")} />;
  } else {
    conteudo = <TelaHome ir={ir} meusEventos={meusEventos} minhasInscricoes={minhasInscricoes} eventosExplorar={eventosExplorar} />;
  }

  const abaAtiva = ["home", "notificacoes"].includes(atual.nome)
    ? "home"
    : ["meus-eventos", "cadastrar-evento", "editar-evento", "evento-gerenciar", "participante", "leitor-qr", "convidar"].includes(atual.nome)
    ? "meus-eventos"
    : ["minhas-inscricoes", "ticket", "evento-explorar"].includes(atual.nome)
    ? atual.nome === "evento-explorar"
      ? "home"
      : "minhas-inscricoes"
    : ["perfil", "alterar-senha"].includes(atual.nome)
    ? "perfil"
    : "";

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: COR.verde, fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes eventflow-spin { to { transform: rotate(360deg); } }
        .eventflow-girando { animation: eventflow-spin 1s linear infinite; transform-origin: center; }
      `}</style>
      {conteudo}
      {logado && <NavInferior ativo={abaAtiva} aoNavegar={irParaAba} />}
    </div>
  );
}
