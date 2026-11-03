/**
 * Chrome Extension i18n utility
 * Provides safe access to chrome.i18n.getMessage with fallbacks
 */

// Fallback messages for when Chrome APIs aren't available (Brazilian Portuguese)
const fallbackMessages: Record<string, string> = {
  // Extension metadata
  extensionName: 'chrome-mcp-server',
  extensionDescription: 'Expõe os recursos do navegador usando o seu próprio Chrome',

  // Section headers
  nativeServerConfigLabel: 'Configuração do servidor nativo',
  semanticEngineLabel: 'Mecanismo semântico',
  embeddingModelLabel: 'Modelo de embedding',
  indexDataManagementLabel: 'Gerenciamento de dados do índice',
  modelCacheManagementLabel: 'Gerenciamento do cache de modelos',

  // Status labels
  statusLabel: 'Status',
  runningStatusLabel: 'Status',
  connectionStatusLabel: 'Status da conexão',
  lastUpdatedLabel: 'Última atualização:',

  // Connection states
  connectButton: 'Conectar',
  disconnectButton: 'Desconectar',
  connectingStatus: 'Conectando...',
  connectedStatus: 'Conectado',
  disconnectedStatus: 'Desconectado',
  detectingStatus: 'Detectando...',

  // Server states
  serviceRunningStatus: 'Serviço em execução (porta: {0})',
  serviceNotConnectedStatus: 'Serviço não conectado',
  connectedServiceNotStartedStatus: 'Conectado, serviço não iniciado',

  // Configuration labels
  mcpServerConfigLabel: 'Configuração do servidor MCP',
  connectionPortLabel: 'Porta de conexão',
  refreshStatusButton: 'Atualizar status',
  copyConfigButton: 'Copiar configuração',

  // Action buttons
  retryButton: 'Tentar novamente',
  cancelButton: 'Cancelar',
  confirmButton: 'Confirmar',
  saveButton: 'Salvar',
  closeButton: 'Fechar',
  resetButton: 'Redefinir',

  // Progress states
  initializingStatus: 'Inicializando...',
  processingStatus: 'Processando...',
  loadingStatus: 'Carregando...',
  clearingStatus: 'Limpando...',
  cleaningStatus: 'Limpando...',
  downloadingStatus: 'Baixando...',

  // Semantic engine states
  semanticEngineReadyStatus: 'Mecanismo semântico pronto',
  semanticEngineInitializingStatus: 'Inicializando o mecanismo semântico...',
  semanticEngineInitFailedStatus: 'Falha ao inicializar o mecanismo semântico',
  semanticEngineNotInitStatus: 'Mecanismo semântico não inicializado',
  initSemanticEngineButton: 'Inicializar mecanismo semântico',
  reinitializeButton: 'Reinicializar',

  // Model states
  downloadingModelStatus: 'Baixando modelo... {0}%',
  switchingModelStatus: 'Trocando de modelo...',
  modelLoadedStatus: 'Modelo carregado',
  modelFailedStatus: 'Falha ao carregar o modelo',

  // Model descriptions
  lightweightModelDescription: 'Modelo multilíngue leve',
  betterThanSmallDescription: 'Um pouco maior que o e5-small, mas com desempenho melhor',
  multilingualModelDescription: 'Modelo semântico multilíngue',

  // Performance levels
  fastPerformance: 'Rápido',
  balancedPerformance: 'Equilibrado',
  accuratePerformance: 'Preciso',

  // Error messages
  networkErrorMessage: 'Erro de conexão de rede. Verifique a rede e tente novamente',
  modelCorruptedErrorMessage: 'Arquivo do modelo corrompido ou incompleto. Tente baixar novamente',
  unknownErrorMessage: 'Erro desconhecido. Verifique se a sua rede consegue acessar o HuggingFace',
  permissionDeniedErrorMessage: 'Permissão negada',
  timeoutErrorMessage: 'A operação excedeu o tempo limite',

  // Data statistics
  indexedPagesLabel: 'Páginas indexadas',
  indexSizeLabel: 'Tamanho do índice',
  activeTabsLabel: 'Abas ativas',
  vectorDocumentsLabel: 'Documentos vetoriais',
  cacheSizeLabel: 'Tamanho do cache',
  cacheEntriesLabel: 'Entradas no cache',

  // Data management
  clearAllDataButton: 'Limpar todos os dados',
  clearAllCacheButton: 'Limpar todo o cache',
  cleanExpiredCacheButton: 'Limpar cache expirado',
  exportDataButton: 'Exportar dados',
  importDataButton: 'Importar dados',

  // Dialog titles
  confirmClearDataTitle: 'Confirmar limpeza dos dados',
  settingsTitle: 'Configurações',
  aboutTitle: 'Sobre',
  helpTitle: 'Ajuda',

  // Dialog messages
  clearDataWarningMessage:
    'Esta operação vai apagar todo o conteúdo indexado das páginas e os dados vetoriais, incluindo:',
  clearDataList1: 'Todo o índice de texto das páginas',
  clearDataList2: 'Dados de embeddings vetoriais',
  clearDataList3: 'Histórico de pesquisa e cache',
  clearDataIrreversibleWarning:
    'Esta operação é irreversível! Depois da limpeza, será preciso navegar pelas páginas de novo para reconstruir o índice.',
  confirmClearButton: 'Confirmar limpeza',

  // Cache states
  cacheDetailsLabel: 'Detalhes do cache',
  noCacheDataMessage: 'Nenhum dado em cache',
  loadingCacheInfoStatus: 'Carregando informações do cache...',
  processingCacheStatus: 'Processando o cache...',
  expiredLabel: 'Expirado',

  // Browser integration
  bookmarksBarLabel: 'Barra de favoritos',
  newTabLabel: 'Nova aba',
  currentPageLabel: 'Página atual',

  // Accessibility
  menuLabel: 'Menu',
  navigationLabel: 'Navegação',
  mainContentLabel: 'Conteúdo principal',

  // Future features
  languageSelectorLabel: 'Idioma',
  themeLabel: 'Tema',
  lightTheme: 'Claro',
  darkTheme: 'Escuro',
  autoTheme: 'Automático',
  advancedSettingsLabel: 'Configurações avançadas',
  debugModeLabel: 'Modo de depuração',
  verboseLoggingLabel: 'Log detalhado',

  // Notifications
  successNotification: 'Operação concluída com sucesso',
  warningNotification: 'Atenção: revise antes de continuar',
  infoNotification: 'Informação',
  configCopiedNotification: 'Configuração copiada para a área de transferência',
  dataClearedNotification: 'Dados limpos com sucesso',

  // Units
  bytesUnit: 'bytes',
  kilobytesUnit: 'KB',
  megabytesUnit: 'MB',
  gigabytesUnit: 'GB',
  itemsUnit: 'itens',
  pagesUnit: 'páginas',

  // Legacy keys for backwards compatibility
  nativeServerConfig: 'Configuração do servidor nativo',
  runningStatus: 'Status',
  refreshStatus: 'Atualizar status',
  lastUpdated: 'Última atualização:',
  mcpServerConfig: 'Configuração do servidor MCP',
  connectionPort: 'Porta de conexão',
  connecting: 'Conectando...',
  disconnect: 'Desconectar',
  connect: 'Conectar',
  semanticEngine: 'Mecanismo semântico',
  embeddingModel: 'Modelo de embedding',
  retry: 'Tentar novamente',
  indexDataManagement: 'Gerenciamento de dados do índice',
  clearing: 'Limpando...',
  clearAllData: 'Limpar todos os dados',
  copyConfig: 'Copiar configuração',
  serviceRunning: 'Serviço em execução (porta: {0})',
  connectedServiceNotStarted: 'Conectado, serviço não iniciado',
  serviceNotConnected: 'Serviço não conectado',
  detecting: 'Detectando...',
  lightweightModel: 'Modelo multilíngue leve',
  betterThanSmall: 'Um pouco maior que o e5-small, mas com desempenho melhor',
  multilingualModel: 'Modelo semântico multilíngue',
  fast: 'Rápido',
  balanced: 'Equilibrado',
  accurate: 'Preciso',
  semanticEngineReady: 'Mecanismo semântico pronto',
  semanticEngineInitializing: 'Inicializando o mecanismo semântico...',
  semanticEngineInitFailed: 'Falha ao inicializar o mecanismo semântico',
  semanticEngineNotInit: 'Mecanismo semântico não inicializado',
  downloadingModel: 'Baixando modelo... {0}%',
  switchingModel: 'Trocando de modelo...',
  networkError: 'Erro de conexão de rede. Verifique a rede e tente novamente',
  modelCorrupted: 'Arquivo do modelo corrompido ou incompleto. Tente baixar novamente',
  unknownError: 'Erro desconhecido. Verifique se a sua rede consegue acessar o HuggingFace',
  reinitialize: 'Reinicializar',
  initializing: 'Inicializando...',
  initSemanticEngine: 'Inicializar mecanismo semântico',
  indexedPages: 'Páginas indexadas',
  indexSize: 'Tamanho do índice',
  activeTabs: 'Abas ativas',
  vectorDocuments: 'Documentos vetoriais',
  confirmClearData: 'Confirmar limpeza dos dados',
  clearDataWarning:
    'Esta operação vai apagar todo o conteúdo indexado das páginas e os dados vetoriais, incluindo:',
  clearDataIrreversible:
    'Esta operação é irreversível! Depois da limpeza, será preciso navegar pelas páginas de novo para reconstruir o índice.',
  confirmClear: 'Confirmar limpeza',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  processing: 'Processando...',
  modelCacheManagement: 'Gerenciamento do cache de modelos',
  cacheSize: 'Tamanho do cache',
  cacheEntries: 'Entradas no cache',
  cacheDetails: 'Detalhes do cache',
  noCacheData: 'Nenhum dado em cache',
  loadingCacheInfo: 'Carregando informações do cache...',
  processingCache: 'Processando o cache...',
  cleaning: 'Limpando...',
  cleanExpiredCache: 'Limpar cache expirado',
  clearAllCache: 'Limpar todo o cache',
  expired: 'Expirado',
  bookmarksBar: 'Barra de favoritos',
};

/**
 * Safe i18n message getter with fallback support
 * @param key Message key
 * @param substitutions Optional substitution values
 * @returns Localized message or fallback
 */
export function getMessage(key: string, substitutions?: string[]): string {
  try {
    // Check if Chrome extension APIs are available
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
      const message = chrome.i18n.getMessage(key, substitutions);
      if (message) {
        return message;
      }
    }
  } catch (error) {
    console.warn(`Failed to get i18n message for key "${key}":`, error);
  }

  // Fallback to Brazilian Portuguese messages
  let fallback = fallbackMessages[key] || key;

  // Handle substitutions in fallback messages
  if (substitutions && substitutions.length > 0) {
    substitutions.forEach((value, index) => {
      fallback = fallback.replace(`{${index}}`, value);
    });
  }

  return fallback;
}

/**
 * Check if Chrome extension i18n APIs are available
 */
export function isI18nAvailable(): boolean {
  try {
    return (
      typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getMessage === 'function'
    );
  } catch {
    return false;
  }
}
