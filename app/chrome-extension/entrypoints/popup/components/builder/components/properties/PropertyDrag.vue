<template>
  <div>
    <SelectorEditor :node="node" :allowPick="true" title="Seletor de início" targetKey="start" />
    <SelectorEditor :node="node" :allowPick="true" title="Seletor de fim" targetKey="end" />
    <div class="hint">
      <small>Dica: o path costuma ser gerado na gravação; ao criar à mão, pode ficar vazio.</small>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';
import SelectorEditor from './SelectorEditor.vue';

defineProps<{ node: NodeBase }>();
</script>

<style scoped>
.hint {
  color: #64748b;
  margin-top: 8px;
}
</style>
