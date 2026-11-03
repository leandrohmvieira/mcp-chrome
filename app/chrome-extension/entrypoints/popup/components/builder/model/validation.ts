import type { NodeBase } from '@/entrypoints/background/record-replay/types';
import { STEP_TYPES } from 'chrome-mcp-shared';

export function validateNode(n: NodeBase): string[] {
  const errs: string[] = [];
  const c: any = n.config || {};

  switch (n.type) {
    case STEP_TYPES.CLICK:
    case STEP_TYPES.DBLCLICK:
    case 'fill': {
      const hasCandidate = !!c?.target?.candidates?.length;
      if (!hasCandidate) errs.push('Faltam candidatos de seletor do alvo');
      if (n.type === 'fill' && (!('value' in c) || c.value === undefined)) errs.push('Falta valor');
      break;
    }
    case STEP_TYPES.WAIT: {
      if (!c?.condition) errs.push('Falta a condição de espera');
      break;
    }
    case STEP_TYPES.ASSERT: {
      if (!c?.assert) errs.push('Falta a condição da asserção');
      break;
    }
    case STEP_TYPES.NAVIGATE: {
      if (!c?.url) errs.push('Falta a URL');
      break;
    }
    case STEP_TYPES.HTTP: {
      if (!c?.url) errs.push('HTTP: falta a URL');
      if (c?.assign && typeof c.assign === 'object') {
        const pathRe = /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+|\[\d+\])*$/;
        for (const v of Object.values(c.assign)) {
          const s = String(v);
          if (!pathRe.test(s)) errs.push(`Assign: caminho inválido ${s}`);
        }
      }
      break;
    }
    case STEP_TYPES.HANDLE_DOWNLOAD: {
      // filenameContains 可选
      break;
    }
    case STEP_TYPES.EXTRACT: {
      if (!c?.saveAs) errs.push('Extract: informe o nome da variável de destino');
      if (!c?.selector && !c?.js) errs.push('Extract: informe selector ou js');
      break;
    }
    case STEP_TYPES.SWITCH_TAB: {
      if (!c?.tabId && !c?.urlContains && !c?.titleContains)
        errs.push('SwitchTab: informe tabId ou URL/título contém');
      break;
    }
    case STEP_TYPES.SCREENSHOT: {
      // selector 可空（全页/可视区），不强制
      break;
    }
    case STEP_TYPES.TRIGGER_EVENT: {
      const hasCandidate = !!c?.target?.candidates?.length;
      if (!hasCandidate) errs.push('Faltam candidatos de seletor do alvo');
      if (!String(c?.event || '').trim()) errs.push('Informe o tipo de evento');
      break;
    }
    case STEP_TYPES.IF: {
      const arr = Array.isArray(c?.branches) ? c.branches : [];
      if (arr.length === 0) errs.push('Adicione pelo menos uma ramificação de condição');
      for (let i = 0; i < arr.length; i++) {
        if (!String(arr[i]?.expr || '').trim()) errs.push(`Ramificação ${i + 1}: expressão vazia`);
      }
      break;
    }
    case STEP_TYPES.SET_ATTRIBUTE: {
      const hasCandidate = !!c?.target?.candidates?.length;
      if (!hasCandidate) errs.push('Faltam candidatos de seletor do alvo');
      if (!String(c?.name || '').trim()) errs.push('Informe o nome do atributo');
      break;
    }
    case STEP_TYPES.LOOP_ELEMENTS: {
      if (!String(c?.selector || '').trim()) errs.push('Informe o seletor do elemento');
      if (!String(c?.subflowId || '').trim()) errs.push('Informe o ID do subfluxo');
      break;
    }
    case STEP_TYPES.SWITCH_FRAME: {
      // Both index/urlContains optional; empty means switch back to top frame
      break;
    }
    case STEP_TYPES.EXECUTE_FLOW: {
      if (!String(c?.flowId || '').trim()) errs.push('Selecione o workflow a executar');
      break;
    }
    case STEP_TYPES.CLOSE_TAB: {
      // 允许空（关闭当前标签页），不强制
      break;
    }
    case STEP_TYPES.SCRIPT: {
      // 若配置了 saveAs/assign，应提供 code
      const hasAssign = c?.assign && Object.keys(c.assign).length > 0;
      if ((c?.saveAs || hasAssign) && !String(c?.code || '').trim())
        errs.push('Script: salvar/mapeamento configurado, mas falta o código');
      if (hasAssign) {
        const pathRe = /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+|\[\d+\])*$/;
        for (const v of Object.values(c.assign || {})) {
          const s = String(v);
          if (!pathRe.test(s)) errs.push(`Assign: caminho inválido ${s}`);
        }
      }
      break;
    }
  }
  return errs;
}

export function validateFlow(nodes: NodeBase[]): {
  totalErrors: number;
  nodeErrors: Record<string, string[]>;
} {
  const nodeErrors: Record<string, string[]> = {};
  let totalErrors = 0;
  for (const n of nodes) {
    const e = validateNode(n);
    if (e.length) {
      nodeErrors[n.id] = e;
      totalErrors += e.length;
    }
  }
  return { totalErrors, nodeErrors };
}
