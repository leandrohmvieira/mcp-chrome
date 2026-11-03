/**
 * 随机 Loading 文案
 * 用于 TimelineStatusStep 组件展示趣味等待提示
 */

const loadingTexts = [
  // 必选神梗
  'Era pra ser tudo calmo e tranquilo',
  'Virou correria e tropeço',
  'Eu sei que você tem pressa, mas calma',
  'Nadando cachorrinho no mar do conhecimento',
  'Deixa a bala voar mais um pouco',
  'Fazendo sua resposta à mão',
  'Convocando os duendes da montanha',
  'Calma, já estou escrevendo (Nova pasta)',
  'Pensando e suando em bicas',
  'A CPU já está quase pegando fogo',
  // 生活气息
  'Torra lenta: o que é bom leva tempo',
  'Virando a panqueca do conhecimento',
  'Um brinde a mim mesmo, já vai',
  'Colocando a inspiração no forno',
  'Deixando a resposta em infusão mais um pouco',
  'Caprichando no astral',
  'Tricotando um suéter de palavras para você',
  // 脑洞大开
  'Neurônios na balada',
  'A coruja da madrugada está pensando',
  'Colorindo a resposta',
  'Folheando a base de conhecimento sem parar',
  'O circo do cérebro vai começar',
  'Juntando os 0 e os 1',
  'Carregando o golpe especial',
  'A lupa embaçou, limpando',
  'Tentando entender esse pedido absurdo',
  // 玄幻
  'Lançando feitiço, não perturbe',
  'Acordando os amigos de silício',
  'Conectando à sabedoria do ciberespaço',
  'Um momento, nobre viajante, estou calculando',
  'Atravessando o buraco negro do conhecimento',
  'Fazendo engenharia reversa da intenção humana',
  'A bola de cristal está embaçada, dando dois tapinhas',
  // 职场
  'O código corre mais que repórter atrás de furo',
  'O responsável já está online, aguarde',
  'Chegando a galope',
  'Transportando conhecimento na velocidade da luz',
  'Encaixando a última peça do quebra-cabeça',
  'Resposta nas cenas finais',
  'Contagem regressiva para o lançamento',
  'Travando a mira no alvo',
];

/**
 * 获取随机 Loading 文案
 */
export function getRandomLoadingText(): string {
  return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
}
