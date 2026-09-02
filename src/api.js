// Camada de acesso à API do backend. Centraliza a URL base, o envio automático
// do token JWT, e a interpretação das respostas de erro (400/403/404) no mesmo
// formato que o TratadorDeErros do backend devolve.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const CHAVE_TOKEN = "eventflow_token";

// Um app de verdade rodando no navegador do usuário (diferente de um artifact
// dentro do chat) — localStorage funciona normalmente aqui.
export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}
export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}
export function removerToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}

async function requisicao(caminho, { metodo = "GET", corpo } = {}) {
  const token = obterToken();
  const headers = {};
  if (corpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method: metodo,
    headers,
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  if (!resposta.ok) {
    throw new Error(await extrairMensagemDeErro(resposta));
  }

  if (resposta.status === 204) return null;

  const tipo = resposta.headers.get("content-type") || "";
  return tipo.includes("application/json") ? resposta.json() : null;
}

// O backend devolve formatos de erro diferentes dependendo do tipo (ver
// TratadorDeErros): uma lista de {campo, mensagem} pra falha de validação,
// ou só uma string pra erro de regra de negócio/permissão.
async function extrairMensagemDeErro(resposta) {
  const padrao = `Erro ${resposta.status} ao falar com o servidor.`;
  try {
    const texto = await resposta.text();
    if (!texto) return padrao;

    try {
      const json = JSON.parse(texto);
      if (Array.isArray(json)) {
        return json.map((e) => `${e.campo}: ${e.mensagem}`).join(" | ");
      }
      if (typeof json === "string") return json;
      if (json?.mensagem) return json.mensagem;
      return padrao;
    } catch {
      return texto;
    }
  } catch {
    return padrao;
  }
}

export const api = {
  get: (caminho) => requisicao(caminho),
  post: (caminho, corpo) => requisicao(caminho, { metodo: "POST", corpo }),
  put: (caminho, corpo) => requisicao(caminho, { metodo: "PUT", corpo }),
  delete: (caminho) => requisicao(caminho, { metodo: "DELETE" }),
};

// Pra imagens protegidas por token (o QR code do ticket): uma tag <img src="...">
// não manda o header Authorization sozinha, então buscamos manualmente e convertemos
// pra uma URL de objeto local que a tag <img> consegue usar.
export async function buscarImagemProtegida(caminho) {
  const token = obterToken();
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resposta.ok) throw new Error(await extrairMensagemDeErro(resposta));
  const blob = await resposta.blob();
  return URL.createObjectURL(blob);
}
