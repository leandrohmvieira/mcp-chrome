<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Seletor do elemento</label>
      <input class="form-input" v-model="(node as any).config.selector" placeholder="Seletor CSS" />
    </div>
    <div class="form-group">
      <label class="form-label">Variável da lista</label>
      <input
        class="form-input"
        v-model="(node as any).config.saveAs"
        placeholder="Padrão: elements"
      />
    </div>
    <div class="form-group">
      <label class="form-label">Variável do item</label>
      <input class="form-input" v-model="(node as any).config.itemVar" placeholder="Padrão: item" />
    </div>
    <div class="form-group">
      <label class="form-label">ID do subfluxo</label>
      <input
        class="form-input"
        v-model="(node as any).config.subflowId"
        placeholder="Selecione ou crie um subfluxo"
      />
      <button class="btn-sm" style="margin-top: 8px" @click="onCreateSubflow">Novo subfluxo</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';

const props = defineProps<{ node: NodeBase }>();
const emit = defineEmits<{ (e: 'create-subflow', id: string): void }>();

function onCreateSubflow() {
  const id = prompt('Informe o ID do novo subfluxo');
  if (!id) return;
  emit('create-subflow', id);
  const n = props.node as any;
  if (n && n.config) n.config.subflowId = id;
}
</script>

<style scoped></style>
