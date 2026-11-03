<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Seletor do elemento (opcional)</label>
      <input
        class="form-input"
        v-model="(node as any).config.selector"
        placeholder="Vazio: captura a área visível ou a página inteira"
      />
    </div>
    <div class="form-group checkbox-group">
      <label class="checkbox-label"
        ><input type="checkbox" v-model="(node as any).config.fullPage" /> Página inteira</label
      >
    </div>
    <div class="form-group">
      <label class="form-label">Salvar em variável</label>
      <input
        class="form-input"
        v-model="(node as any).config.saveAs"
        placeholder="Nome da variável, ex.: shot"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';
defineProps<{ node: NodeBase }>();
</script>

<style scoped></style>
