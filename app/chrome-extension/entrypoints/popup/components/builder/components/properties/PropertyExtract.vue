<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Seletor do elemento (opcional)</label>
      <input class="form-input" v-model="(node as any).config.selector" placeholder="Seletor CSS" />
    </div>
    <div class="form-group">
      <label class="form-label">Atributo</label>
      <input
        class="form-input"
        v-model="(node as any).config.attr"
        placeholder="text/textContent ou nome do atributo"
      />
    </div>
    <div class="form-group">
      <label class="form-label">JS customizado (retorna valor)</label>
      <textarea
        class="form-textarea"
        v-model="(node as any).config.js"
        rows="3"
        placeholder="return document.title"
      ></textarea>
    </div>
    <div class="form-group" :class="{ invalid: !(node as any).config?.saveAs }">
      <label class="form-label">Salvar em variável</label>
      <input class="form-input" v-model="(node as any).config.saveAs" placeholder="Variável" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';
defineProps<{ node: NodeBase }>();
</script>

<style scoped></style>
