<template>
  <div class="form-section">
    <div class="form-group checkbox-group">
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.enabled" /> Ativar gatilho</label
      >
    </div>
    <div class="form-group">
      <label class="form-label">Descrição (opcional)</label>
      <input class="form-input" v-model="cfg.description" placeholder="Para que serve o gatilho" />
    </div>
  </div>

  <div class="divider"></div>

  <div class="form-section">
    <div class="section-header"><span class="section-title">Formas de disparo</span></div>
    <div class="form-group checkbox-group">
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.manual" /> Manual</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.url" /> Ao acessar URL</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.contextMenu" /> Menu de contexto</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.command" /> Atalho</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.dom" /> Mudança no DOM</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.modes.schedule" /> Agendamento</label
      >
    </div>
  </div>

  <div v-if="cfg.modes.url" class="form-section">
    <div class="section-title">Regras de URL</div>
    <div class="selector-list">
      <div v-for="(r, i) in urlRules" :key="i" class="selector-item">
        <select class="form-select-sm" v-model="r.kind">
          <option value="url">Prefixo de URL</option>
          <option value="domain">Domínio contém</option>
          <option value="path">Prefixo do caminho</option>
        </select>
        <input
          class="form-input-sm flex-1"
          v-model="r.value"
          placeholder="Ex.: https://example.com/app"
        />
        <button class="btn-icon-sm" @click="move(urlRules, i, -1)" :disabled="i === 0">↑</button>
        <button
          class="btn-icon-sm"
          @click="move(urlRules, i, 1)"
          :disabled="i === urlRules.length - 1"
          >↓</button
        >
        <button class="btn-icon-sm danger" @click="urlRules.splice(i, 1)">×</button>
      </div>
    </div>
    <button class="btn-sm" @click="urlRules.push({ kind: 'url', value: '' })">+ Nova regra</button>
  </div>

  <div v-if="cfg.modes.contextMenu" class="form-section">
    <div class="section-title">Menu de contexto</div>
    <div class="form-group">
      <label class="form-label">Título</label>
      <input class="form-input" v-model="cfg.contextMenu.title" placeholder="Título do menu" />
    </div>
    <div class="form-group">
      <label class="form-label">Contextos</label>
      <div class="checkbox-group">
        <label class="checkbox-label" v-for="c in menuContexts" :key="c">
          <input type="checkbox" :value="c" v-model="cfg.contextMenu.contexts" /> {{ c }}
        </label>
      </div>
    </div>
  </div>

  <div v-if="cfg.modes.command" class="form-section">
    <div class="section-title">Atalho</div>
    <div class="form-group">
      <label class="form-label">Comando (precisa estar declarado em commands no manifest)</label>
      <input
        class="form-input"
        v-model="cfg.command.commandKey"
        placeholder="Ex.: run_quick_trigger_1"
      />
    </div>
    <div class="text-xs text-slate-500" style="padding: 0 20px"
      >Dica: atalhos da extensão são fixos no manifest; não dá para criá-los em runtime.</div
    >
  </div>

  <div v-if="cfg.modes.dom" class="form-section">
    <div class="section-title">Mudança no DOM</div>
    <div class="form-group">
      <label class="form-label">Seletor</label>
      <input class="form-input" v-model="cfg.dom.selector" placeholder="#app .item" />
    </div>
    <div class="form-group checkbox-group">
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.dom.appear" /> Disparar ao aparecer</label
      >
      <label class="checkbox-label"
        ><input type="checkbox" v-model="cfg.dom.once" /> Disparar só uma vez</label
      >
    </div>
    <div class="form-group">
      <label class="form-label">Debounce (ms)</label>
      <input class="form-input" type="number" min="0" v-model.number="cfg.dom.debounceMs" />
    </div>
  </div>

  <div v-if="cfg.modes.schedule" class="form-section">
    <div class="section-title">Agendamento</div>
    <div class="selector-list">
      <div v-for="(s, i) in schedules" :key="i" class="selector-item">
        <select class="form-select-sm" v-model="s.type">
          <option value="interval">Intervalo (min)</option>
          <option value="daily">Diário (HH:mm)</option>
          <option value="once">Uma vez (data ISO)</option>
        </select>
        <input
          class="form-input-sm flex-1"
          v-model="s.when"
          placeholder="5 ou 09:00 ou 2025-01-01T10:00:00"
        />
        <label class="checkbox-label"><input type="checkbox" v-model="s.enabled" /> Ativo</label>
        <button class="btn-icon-sm" @click="move(schedules, i, -1)" :disabled="i === 0">↑</button>
        <button
          class="btn-icon-sm"
          @click="move(schedules, i, 1)"
          :disabled="i === schedules.length - 1"
          >↓</button
        >
        <button class="btn-icon-sm danger" @click="schedules.splice(i, 1)">×</button>
      </div>
    </div>
    <button class="btn-sm" @click="schedules.push({ type: 'interval', when: '5', enabled: true })"
      >+ Adicionar agendamento</button
    >
  </div>

  <div class="divider"></div>
  <div class="form-section">
    <div class="text-xs text-slate-500" style="padding: 0 20px"
      >Nota: ao salvar o workflow, os gatilhos são sincronizados com a tabela de gatilhos em segundo
      plano (URL/menu de contexto/atalho/DOM) e com as tarefas agendadas (intervalo/diário/uma vez).
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue';
import type { NodeBase } from '@/entrypoints/background/record-replay/types';

const props = defineProps<{ node: NodeBase }>();

function ensure() {
  const n: any = props.node;
  if (!n.config) n.config = {};
  if (!n.config.modes)
    n.config.modes = {
      manual: true,
      url: false,
      contextMenu: false,
      command: false,
      dom: false,
      schedule: false,
    };
  if (!n.config.url) n.config.url = { rules: [] };
  if (!n.config.contextMenu)
    n.config.contextMenu = { title: 'Executar workflow', contexts: ['all'], enabled: false };
  if (!n.config.command) n.config.command = { commandKey: '', enabled: false };
  if (!n.config.dom)
    n.config.dom = { selector: '', appear: true, once: true, debounceMs: 800, enabled: false };
  if (!Array.isArray(n.config.schedules)) n.config.schedules = [];
}

const cfg = computed<any>({
  get() {
    ensure();
    return (props.node as any).config;
  },
  set(v) {
    (props.node as any).config = v;
  },
});

const urlRules = computed({
  get() {
    ensure();
    return (props.node as any).config.url.rules as Array<any>;
  },
  set(v) {
    (props.node as any).config.url.rules = v;
  },
});

const schedules = computed({
  get() {
    ensure();
    return (props.node as any).config.schedules as Array<any>;
  },
  set(v) {
    (props.node as any).config.schedules = v;
  },
});

const menuContexts = ['all', 'page', 'selection', 'image', 'link', 'video', 'audio'];

function move(arr: any[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}
</script>

<style scoped></style>
