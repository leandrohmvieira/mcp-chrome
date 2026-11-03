<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">ID da aba (opcional)</label>
      <input
        class="form-input"
        type="number"
        v-model.number="(node as any).config.tabId"
        placeholder="Número"
      />
    </div>
    <div class="form-group" :class="{ invalid: needOne && !hasAny }">
      <label class="form-label">URL contém (opcional)</label>
      <input class="form-input" v-model="(node as any).config.urlContains" placeholder="Trecho" />
    </div>
    <div class="form-group" :class="{ invalid: needOne && !hasAny }">
      <label class="form-label">Título contém (opcional)</label>
      <input
        class="form-input"
        v-model="(node as any).config.titleContains"
        placeholder="Trecho do título"
      />
    </div>
    <div
      v-if="needOne && !hasAny"
      class="text-xs text-slate-500"
      style="padding: 0 20px; color: var(--rr-danger)"
      >Informe tabId, URL contém ou Título contém</div
    >
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue';
import type { NodeBase } from '@/entrypoints/background/record-replay/types';

const props = defineProps<{ node: NodeBase }>();
const needOne = true;
const hasAny = computed(() => {
  const c: any = (props.node as any).config || {};
  return !!(c.tabId || c.urlContains || c.titleContains);
});
</script>

<style scoped></style>
