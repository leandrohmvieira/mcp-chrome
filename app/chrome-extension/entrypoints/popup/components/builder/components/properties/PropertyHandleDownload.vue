<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Nome do arquivo contém (opcional)</label>
      <input
        class="form-input"
        v-model="(node as any).config.filenameContains"
        placeholder="Trecho do nome do arquivo ou da URL"
      />
    </div>
    <div class="form-group">
      <label class="form-label">Tempo limite (ms)</label>
      <input
        class="form-input"
        v-model="(node as any).config.timeoutMs"
        placeholder="Padrão: 60000"
      />
    </div>
    <div class="form-group checkbox-group">
      <label class="checkbox-label"
        ><input type="checkbox" v-model="(node as any).config.waitForComplete" /> Aguardar o
        download terminar</label
      >
    </div>
    <div class="form-group">
      <label class="form-label">Salvar em variável</label>
      <input
        class="form-input"
        v-model="(node as any).config.saveAs"
        placeholder="Padrão: download"
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
