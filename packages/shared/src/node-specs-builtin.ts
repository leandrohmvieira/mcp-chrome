// node-specs-builtin.ts — builtin NodeSpecs shared for UI + runtime
import type { NodeSpec } from './node-spec';
import { registerNodeSpec } from './node-spec-registry';
import { STEP_TYPES } from './step-types';

export function registerBuiltinSpecs() {
  const nav: NodeSpec = {
    type: STEP_TYPES.NAVIGATE,
    version: 1,
    display: { label: 'Navegar', iconClass: 'icon-navigate', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        placeholder: 'https://example.com',
        help: 'Endereço de destino; aceita template de variável {var}',
        default: '',
      },
    ],
    defaults: { url: '' },
    validate: (cfg) => {
      const errs: string[] = [];
      if (!cfg || !cfg.url || String(cfg.url).trim() === '') errs.push('URL obrigatória');
      return errs;
    },
  };
  registerNodeSpec(nav);

  // Click / Dblclick
  registerNodeSpec({
    type: STEP_TYPES.CLICK,
    version: 1,
    display: { label: 'Clicar', iconClass: 'icon-click', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'target',
        label: 'Alvo',
        type: 'json',
        widget: 'targetlocator',
        help: 'Selecione ou digite o seletor do elemento',
      },
      {
        key: 'before',
        label: 'Antes de executar',
        type: 'object',
        fields: [
          { key: 'scrollIntoView', label: 'Rolar até o elemento', type: 'boolean', default: true },
          { key: 'waitForSelector', label: 'Esperar seletor', type: 'boolean', default: true },
        ],
      },
      {
        key: 'after',
        label: 'Depois de executar',
        type: 'object',
        fields: [
          { key: 'waitForNavigation', label: 'Esperar navegação', type: 'boolean', default: false },
          {
            key: 'waitForNetworkIdle',
            label: 'Esperar rede ociosa',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
    defaults: { before: { scrollIntoView: true, waitForSelector: true }, after: {} },
  });
  registerNodeSpec({
    type: STEP_TYPES.DBLCLICK,
    version: 1,
    display: { label: 'Clique duplo', iconClass: 'icon-click', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'target', label: 'Alvo', type: 'json', widget: 'targetlocator' },
      {
        key: 'before',
        label: 'Antes de executar',
        type: 'object',
        fields: [
          { key: 'scrollIntoView', label: 'Rolar até o elemento', type: 'boolean', default: true },
          { key: 'waitForSelector', label: 'Esperar seletor', type: 'boolean', default: true },
        ],
      },
      {
        key: 'after',
        label: 'Depois de executar',
        type: 'object',
        fields: [
          { key: 'waitForNavigation', label: 'Esperar navegação', type: 'boolean', default: false },
          {
            key: 'waitForNetworkIdle',
            label: 'Esperar rede ociosa',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
    defaults: { before: { scrollIntoView: true, waitForSelector: true }, after: {} },
  });

  // Fill
  registerNodeSpec({
    type: STEP_TYPES.FILL,
    version: 1,
    display: { label: 'Preencher', iconClass: 'icon-fill', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'target', label: 'Alvo', type: 'json', widget: 'targetlocator' },
      { key: 'value', label: 'Valor', type: 'string', required: true, help: 'Aceita {var}' },
    ],
    defaults: { value: '' },
  });

  // Key
  registerNodeSpec({
    type: STEP_TYPES.KEY,
    version: 1,
    display: { label: 'Teclado', iconClass: 'icon-key', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'keys',
        label: 'Sequência de teclas',
        type: 'string',
        widget: 'keysequence',
        required: true,
        help: 'Ex.: Backspace Enter ou cmd+a',
      },
      { key: 'target', label: 'Alvo do foco (opcional)', type: 'json', widget: 'targetlocator' },
    ],
    defaults: { keys: '' },
  });

  // Scroll
  registerNodeSpec({
    type: STEP_TYPES.SCROLL,
    version: 1,
    display: { label: 'Rolar', iconClass: 'icon-scroll', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'mode',
        label: 'Modo',
        type: 'select',
        options: [
          { label: 'Elemento', value: 'element' },
          { label: 'Deslocamento', value: 'offset' },
          { label: 'Contêiner', value: 'container' },
        ] as any,
        default: 'offset',
      },
      { key: 'target', label: 'Alvo (elemento/contêiner)', type: 'json', widget: 'targetlocator' },
      {
        key: 'offset',
        label: 'Deslocamento',
        type: 'object',
        fields: [
          { key: 'x', label: 'X', type: 'number' },
          { key: 'y', label: 'Y', type: 'number' },
        ],
      },
    ],
    defaults: { mode: 'offset', offset: { x: 0, y: 300 } },
  });

  // Drag
  registerNodeSpec({
    type: STEP_TYPES.DRAG,
    version: 1,
    display: { label: 'Arrastar', iconClass: 'icon-drag', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'start', label: 'Início', type: 'json', widget: 'targetlocator' },
      { key: 'end', label: 'Fim', type: 'json', widget: 'targetlocator' },
      {
        key: 'path',
        label: 'Coordenadas do trajeto',
        type: 'array',
        item: {
          key: 'p',
          label: 'Ponto',
          type: 'object',
          fields: [
            { key: 'x', label: 'X', type: 'number' },
            { key: 'y', label: 'Y', type: 'number' },
          ],
        } as any,
      },
    ],
    defaults: {},
  });

  // Wait
  registerNodeSpec({
    type: STEP_TYPES.WAIT,
    version: 1,
    display: { label: 'Aguardar', iconClass: 'icon-wait', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'condition',
        label: 'Condição (JSON)',
        type: 'json',
        help: 'Ex.: {"sleep":1000} ou {"text":"Hello","appear":true}',
      },
    ],
    defaults: { condition: { sleep: 500 } },
  });

  // Assert
  registerNodeSpec({
    type: STEP_TYPES.ASSERT,
    version: 1,
    display: { label: 'Asserção', iconClass: 'icon-assert', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }, { label: 'onError' }] },
    schema: [
      {
        key: 'assert',
        label: 'Asserção (JSON)',
        type: 'json',
        help: 'Ex.: {"exists":"#id"} / {"visible":".btn"}',
      },
      {
        key: 'failStrategy',
        label: 'Em caso de falha',
        type: 'select',
        options: [
          { label: 'Parar', value: 'stop' },
          { label: 'Avisar', value: 'warn' },
          { label: 'Tentar novamente', value: 'retry' },
        ] as any,
        default: 'stop',
      },
    ],
    defaults: { assert: {} },
  });

  // HTTP
  registerNodeSpec({
    type: STEP_TYPES.HTTP,
    version: 1,
    display: { label: 'HTTP', iconClass: 'icon-http', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'method',
        label: 'Método',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
          label: m,
          value: m,
        })) as any,
        default: 'GET',
      },
      { key: 'url', label: 'URL', type: 'string', required: true },
      { key: 'headers', label: 'Cabeçalhos (JSON)', type: 'json' },
      { key: 'body', label: 'Corpo (JSON)', type: 'json' },
      { key: 'formData', label: 'Formulário (JSON)', type: 'json' },
      { key: 'saveAs', label: 'Salvar em variável', type: 'string' },
      { key: 'assign', label: 'Mapeamento (JSON)', type: 'json' },
    ],
    defaults: { method: 'GET' },
  });

  // Extract
  registerNodeSpec({
    type: STEP_TYPES.EXTRACT,
    version: 1,
    display: { label: 'Extrair', iconClass: 'icon-extract', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'selector', label: 'Seletor', type: 'string', widget: 'selector' },
      {
        key: 'attr',
        label: 'Atributo',
        type: 'select',
        options: [
          { label: 'Texto (text)', value: 'text' },
          { label: 'Texto (textContent)', value: 'textContent' },
          { label: 'Nome de atributo personalizado', value: 'attr' },
        ] as any,
      },
      { key: 'js', label: 'JS customizado', type: 'string', help: 'Roda na página; retorna valor' },
      { key: 'saveAs', label: 'Salvar em variável', type: 'string', required: true },
    ],
    defaults: { saveAs: '' },
  });

  // Screenshot
  registerNodeSpec({
    type: STEP_TYPES.SCREENSHOT,
    version: 1,
    display: { label: 'Captura de tela', iconClass: 'icon-screenshot', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'selector', label: 'Seletor do alvo', type: 'string' },
      { key: 'fullPage', label: 'Página inteira', type: 'boolean', default: false },
      { key: 'saveAs', label: 'Salvar em variável', type: 'string' },
    ],
    defaults: { fullPage: false },
  });

  // TriggerEvent
  registerNodeSpec({
    type: STEP_TYPES.TRIGGER_EVENT,
    version: 1,
    display: { label: 'Disparar evento', iconClass: 'icon-trigger', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'target', label: 'Alvo', type: 'json', widget: 'targetlocator' },
      { key: 'event', label: 'Tipo de evento', type: 'string', required: true },
      { key: 'bubbles', label: 'Propagar', type: 'boolean', default: true },
      { key: 'cancelable', label: 'Cancelável', type: 'boolean', default: false },
    ],
    defaults: { event: '' },
  });

  // SetAttribute
  registerNodeSpec({
    type: STEP_TYPES.SET_ATTRIBUTE,
    version: 1,
    display: { label: 'Definir atributo', iconClass: 'icon-attr', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'target', label: 'Alvo', type: 'json', widget: 'targetlocator' },
      { key: 'name', label: 'Nome do atributo', type: 'string', required: true },
      { key: 'value', label: 'Valor do atributo', type: 'string' },
      { key: 'remove', label: 'Remover atributo', type: 'boolean', default: false },
    ],
    defaults: { remove: false },
  });

  // LoopElements
  registerNodeSpec({
    type: STEP_TYPES.LOOP_ELEMENTS,
    version: 1,
    display: { label: 'Percorrer elementos', iconClass: 'icon-loop', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'selector', label: 'Seletor', type: 'string', required: true },
      { key: 'saveAs', label: 'Variável da lista', type: 'string', default: 'elements' },
      { key: 'itemVar', label: 'Variável do item', type: 'string', default: 'item' },
      { key: 'subflowId', label: 'ID do subfluxo', type: 'string', required: true },
    ],
    defaults: { saveAs: 'elements', itemVar: 'item' },
  });

  // SwitchFrame
  registerNodeSpec({
    type: STEP_TYPES.SWITCH_FRAME,
    version: 1,
    display: { label: 'Trocar frame', iconClass: 'icon-frame', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'frame',
        label: 'Localizar frame',
        type: 'object',
        fields: [
          { key: 'index', label: 'Índice', type: 'number' },
          { key: 'urlContains', label: 'URL contém', type: 'string' },
        ],
      },
    ],
    defaults: {},
  });

  // HandleDownload
  registerNodeSpec({
    type: STEP_TYPES.HANDLE_DOWNLOAD,
    version: 1,
    display: { label: 'Tratar download', iconClass: 'icon-download', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'filenameContains', label: 'Nome do arquivo contém', type: 'string' },
      { key: 'waitForComplete', label: 'Aguardar conclusão', type: 'boolean', default: true },
      { key: 'timeoutMs', label: 'Tempo limite (ms)', type: 'number', default: 60000 },
      { key: 'saveAs', label: 'Salvar em variável', type: 'string' },
    ],
    defaults: { waitForComplete: true, timeoutMs: 60000 },
  });

  // Script
  registerNodeSpec({
    type: STEP_TYPES.SCRIPT,
    version: 1,
    display: { label: 'Script', iconClass: 'icon-script', category: 'Tools' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'world',
        label: 'Contexto de execução',
        type: 'select',
        options: [
          { label: 'ISOLATED', value: 'ISOLATED' },
          { label: 'MAIN', value: 'MAIN' },
        ] as any,
        default: 'ISOLATED',
      },
      { key: 'code', label: 'Código do script', type: 'string', widget: 'code', required: true },
      {
        key: 'when',
        label: 'Momento da execução',
        type: 'select',
        options: [
          { label: 'before', value: 'before' },
          { label: 'after', value: 'after' },
        ] as any,
        default: 'after',
      },
      { key: 'assign', label: 'Mapeamento (JSON)', type: 'json' },
      { key: 'saveAs', label: 'Salvar em variável', type: 'string' },
    ],
    defaults: { world: 'ISOLATED', when: 'after' },
  });

  // Tabs
  registerNodeSpec({
    type: STEP_TYPES.OPEN_TAB,
    version: 1,
    display: { label: 'Abrir aba', iconClass: 'icon-openTab', category: 'Tabs' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'url', label: 'URL', type: 'string' },
      { key: 'newWindow', label: 'Nova janela', type: 'boolean', default: false },
    ],
    defaults: { newWindow: false },
  });
  registerNodeSpec({
    type: 'executeFlow' as any,
    version: 1,
    display: { label: 'Executar subfluxo', iconClass: 'icon-exec', category: 'Flow' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'flowId', label: 'ID do fluxo', type: 'string', required: true },
      { key: 'inline', label: 'Executar inline', type: 'boolean', default: false },
      { key: 'args', label: 'Argumentos (JSON)', type: 'json' },
    ],
    defaults: { inline: false },
  });
  registerNodeSpec({
    type: STEP_TYPES.SWITCH_TAB,
    version: 1,
    display: { label: 'Trocar aba', iconClass: 'icon-switchTab', category: 'Tabs' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'tabId', label: 'TabId', type: 'number' },
      { key: 'urlContains', label: 'URL contém', type: 'string' },
      { key: 'titleContains', label: 'Título contém', type: 'string' },
    ],
    defaults: {},
  });
  registerNodeSpec({
    type: STEP_TYPES.CLOSE_TAB,
    version: 1,
    display: { label: 'Fechar aba', iconClass: 'icon-closeTab', category: 'Tabs' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'tabIds',
        label: 'TabIds',
        type: 'array',
        item: { key: 'id', label: 'id', type: 'number' } as any,
      },
      { key: 'url', label: 'URL', type: 'string' },
    ],
    defaults: {},
  });

  // Logic
  registerNodeSpec({
    type: STEP_TYPES.IF,
    version: 1,
    display: { label: 'Condição', iconClass: 'icon-if', category: 'Logic' },
    ports: { inputs: 1, outputs: 'any' },
    schema: [
      {
        key: 'condition',
        label: 'Expressão de condição (JSON)',
        type: 'json',
        help: 'Ex.: {"expression":"vars.a>0"}',
      },
      {
        key: 'branches',
        label: 'Ramificações',
        type: 'array',
        item: {
          key: 'b',
          label: 'case',
          type: 'object',
          fields: [
            { key: 'id', label: 'ID', type: 'string' },
            { key: 'name', label: 'Nome', type: 'string' },
            { key: 'expr', label: 'Expressão', type: 'string' },
          ],
        } as any,
      },
      { key: 'else', label: 'Ativar else', type: 'boolean', default: true },
    ],
    defaults: { else: true },
  });
  registerNodeSpec({
    type: STEP_TYPES.FOREACH,
    version: 1,
    display: { label: 'Para cada', iconClass: 'icon-foreach', category: 'Logic' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'listVar', label: 'Variável da lista', type: 'string', required: true },
      { key: 'itemVar', label: 'Variável do item', type: 'string', default: 'item' },
      { key: 'subflowId', label: 'ID do subfluxo', type: 'string', required: true },
      {
        key: 'concurrency',
        label: 'Concorrência',
        type: 'number',
        default: 1,
        help: 'Executa o subfluxo em paralelo (variáveis em cópia rasa, sem mesclagem automática)',
      },
    ],
    defaults: { itemVar: 'item' },
  });
  registerNodeSpec({
    type: STEP_TYPES.WHILE,
    version: 1,
    display: { label: 'Enquanto', iconClass: 'icon-while', category: 'Logic' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'condition', label: 'Condição (JSON)', type: 'json' },
      { key: 'subflowId', label: 'ID do subfluxo', type: 'string', required: true },
      { key: 'maxIterations', label: 'Máximo de iterações', type: 'number', default: 100 },
    ],
    defaults: { maxIterations: 100 },
  });

  // Delay (UI-only helper)
  registerNodeSpec({
    type: STEP_TYPES.DELAY,
    version: 1,
    display: { label: 'Atraso', iconClass: 'icon-delay', category: 'Actions' },
    ports: { inputs: 1, outputs: [{ label: 'default' }] },
    schema: [
      {
        key: 'sleep',
        label: 'Atraso',
        type: 'number',
        widget: 'duration',
        required: true,
        default: 1000,
      },
    ],
    defaults: { sleep: 1000 },
  });

  // Trigger (builder-only, flow-level node)
  registerNodeSpec({
    type: STEP_TYPES.TRIGGER,
    version: 1,
    display: { label: 'Gatilho', iconClass: 'icon-trigger', category: 'Flow' },
    ports: { inputs: 0, outputs: [{ label: 'default' }] },
    schema: [
      { key: 'enabled', label: 'Ativado', type: 'boolean', default: true },
      { key: 'description', label: 'Descrição', type: 'string' },
      {
        key: 'modes',
        label: 'Modo',
        type: 'object',
        fields: [
          { key: 'manual', label: 'Manual', type: 'boolean', default: true },
          { key: 'url', label: 'Por URL', type: 'boolean', default: false },
          { key: 'contextMenu', label: 'Menu de contexto', type: 'boolean', default: false },
          { key: 'command', label: 'Atalho', type: 'boolean', default: false },
          { key: 'dom', label: 'Evento DOM', type: 'boolean', default: false },
          { key: 'schedule', label: 'Agendamento', type: 'boolean', default: false },
        ],
      },
      {
        key: 'url',
        label: 'Regras de URL',
        type: 'object',
        fields: [
          {
            key: 'rules',
            label: 'Lista de regras',
            type: 'array',
            item: {
              key: 'rule',
              label: 'Regra',
              type: 'object',
              fields: [
                {
                  key: 'kind',
                  label: 'Tipo',
                  type: 'select',
                  options: [
                    { label: 'URL', value: 'url' },
                    { label: 'Domínio', value: 'domain' },
                    { label: 'Caminho', value: 'path' },
                  ] as any,
                  default: 'url',
                },
                { key: 'value', label: 'Valor', type: 'string' },
              ],
            } as any,
          },
        ],
      },
      {
        key: 'contextMenu',
        label: 'Menu de contexto',
        type: 'object',
        fields: [
          { key: 'title', label: 'Título', type: 'string', default: 'Executar workflow' },
          { key: 'enabled', label: 'Ativado', type: 'boolean', default: false },
        ],
      },
      {
        key: 'command',
        label: 'Atalho',
        type: 'object',
        fields: [
          { key: 'commandKey', label: 'Atalho', type: 'string' },
          { key: 'enabled', label: 'Ativado', type: 'boolean', default: false },
        ],
      },
      {
        key: 'dom',
        label: 'Evento DOM',
        type: 'object',
        fields: [
          { key: 'selector', label: 'Seletor', type: 'string' },
          { key: 'appear', label: 'Ao aparecer', type: 'boolean', default: true },
          { key: 'once', label: 'Uma vez', type: 'boolean', default: true },
          { key: 'debounceMs', label: 'Debounce (ms)', type: 'number', default: 800 },
          { key: 'enabled', label: 'Ativado', type: 'boolean', default: false },
        ],
      },
      {
        key: 'schedules',
        label: 'Agendamento',
        type: 'array',
        item: {
          key: 'sched',
          label: 'Agendamento',
          type: 'object',
          fields: [
            { key: 'id', label: 'ID', type: 'string' },
            {
              key: 'type',
              label: 'Tipo',
              type: 'select',
              options: [
                { label: 'Uma vez', value: 'once' },
                { label: 'Intervalo', value: 'interval' },
                { label: 'Diário', value: 'daily' },
              ] as any,
            },
            { key: 'when', label: 'Horário (ISO/cron)', type: 'string' },
            { key: 'enabled', label: 'Ativado', type: 'boolean', default: true },
          ],
        } as any,
      },
    ],
    defaults: { enabled: true },
  });
}
