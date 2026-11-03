# O que o chrome-devtools-mcp tem e o nosso fork não tem

Levantamento de 2026-11-03, conferido no código: chrome-devtools-mcp `92fc339` contra o fork em `1b464fd`.
O devtools-mcp documenta 60 ferramentas, mais 3 do modo slim e 5 ocultas. O nosso anuncia 27 fixas,
mais os `flow.*` publicados pelo record-replay.

**Ferramentas que já existem no código, mas não são anunciadas** (o schema está comentado em
`packages/shared/src/tools.ts`):
- `search_tabs_content`
- `chrome_userscript`
- `chrome_inject_script` e `chrome_send_command_to_inject_script`
- `chrome_get_interactive_elements`
- `record_replay_flow_run` e `record_replay_list_published`
- as legadas `chrome_network_capture_start/stop` e `chrome_network_debugger_start/stop`

## Lacunas

| Área | devtools-mcp | Nosso fork hoje |
|---|---|---|
| Rede | `list_network_requests` / `get_network_request`: log sempre ligado, reqid, filtro por tipo, cadeia de redirects, histórico das últimas N navegações, bodies salvos em arquivo, `--redactNetworkHeaders` | `chrome_network_capture` com start/stop. Modo webRequest sem body. Modo debugger com no máximo 100 requests e 1MB, e o redirect sobrescreve a request anterior |
| Console | `list/get_console_message`: IDs, histórico entre navegações, stack traces com source maps, Issues do DevTools (CORS, SameSite, CSP, mixed content) | `chrome_console`: buffer por aba, limpo quando muda o domínio, sem IDs, stack cru |
| CSS | `get_css_styles` (cascata) | nada |
| Avaliar JS | `evaluate_script`: elementos do snapshot como argumento, código e saída em arquivo, `dialogAction` | `chrome_javascript`: só texto, sem frameId |
| Service workers | listar, avaliar, ler console | nada |
| Performance | trace por `pageId`, `filePath`, `insightSetId`, CrUX (`--performanceCrux`), Lighthouse (`lighthouse_audit`) | trace só da aba ativa, gravado em Downloads, sem Lighthouse |
| Emulação | `emulate`: viewport/DPR/mobile/touch, UA, geolocalização, color scheme, reduced-motion, throttling de CPU e de rede, offline | só `computer resize_page`, e provavelmente o override some no detach |
| Memória | `take_heapsnapshot` + 13 ferramentas de análise (`--memoryDebugging`) | nada |
| Snapshot | `take_snapshot` via CDP: inclui iframes, verbose, saída em arquivo; `includeSnapshot` após as ações; espera automática por DOM estável | `chrome_read_page` por content script, limitado ao viewport (salvo `filter:"all"`); refs que expiram |
| Screenshot | png/jpeg/webp, qualidade, caminho livre, elemento por uid | jpeg em base64, ou PNG salvo em Downloads |
| Upload / diálogos | intercepta o file chooser; `handle_dialog` por página; `handleBeforeUnload` | só seletor de `input[type=file]`; diálogo sempre da aba ativa |
| Páginas | `isolatedContext`, `initScript`, reload ignorando cache, `--pageIdRouting` | nada disso; o tabId padrão é a aba ativa, com risco de agir na aba errada |
| Extensões / PWA / WebAuthn / WebMCP | categorias `--category*` | nada |
| Servidor | lançar o próprio Chrome (headless, isolado, canal), `--browserUrl`/`--wsEndpoint`/`--autoConnect`, listas de URL bloqueadas e permitidas, categorias e slim, `--no-javascript-evaluation`, restrição de filesystem, config com hot reload, CLI com daemon, skills | nada (lista de ferramentas fixa, sem travas de segurança) |

## O que só o nosso tem (não perder)

- **Favoritos e histórico.**
- **Busca semântica nas abas** (oculta).
- **Gravação em GIF** com anotações.
- **Seleção de elemento pelo usuário.**
- **`network_request` com os cookies do navegador.**
- **`get_web_content`.**
- **`handle_download`.**
- **`computer`** com zoom e coordenadas mapeadas a partir do screenshot.
- **`background:true`:** não rouba o foco.
- **Perfil real logado sem porta de debug.**
- **HTTP Streamable em `:12306`:** vários clientes, incluindo a VPS.
- **Captura via webRequest:** sem a barra amarela do debugger.
- **Upload a partir de URL ou base64.**
- **Flows publicados como ferramentas MCP.**

## Top 5 para portar

Restrição comum: o que precisa ficar "sempre ligado" mantém o debugger anexado. Isso mostra a barra
amarela, a menos que o Chrome rode com `--silent-debugger-extension-api`, e conflita com o DevTools aberto.

1. **Inspetor de rede persistente (M):** reqid, filtro por tipo, histórico e bodies em arquivo, reaproveitando `network-capture-debugger.ts`.
2. **`emulate` e correção do `resize_page` (M):** precisa de uma sessão dona da emulação. UA e headers podem ir por DNR.
3. **Controle e segurança (S/M):** categorias e modo slim em `register-tools.ts`, listas de URLs permitidas e bloqueadas, desligar avaliação de JS, restringir caminhos de arquivo. Importa porque o endpoint HTTP é exposto na VPS.
4. **Console de verdade (M):** IDs, histórico, source maps, Issues via `Audits`.
5. **Snapshot via CDP e espera após ações (M):** `Accessibility.getFullAXTree` com iframes e `includeSnapshot`.

**Fáceis de ganhar:**
- **Performance (S):** paridade com tabId e `filePath`.
- **`get_css_styles` (S/M).**
- **`initScript` (S):** reexpor o `chrome_userscript`.
- **Reexpor as ferramentas ocultas (S).**

**Não vale tentar:**
- **Contextos isolados:** o `chrome.debugger` não cria browser contexts.
- **Lançar o Chrome com a extensão:** o Chrome 151 ignora `--load-extension`.
