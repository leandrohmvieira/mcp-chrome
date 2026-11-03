<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Código</label>
      <textarea
        class="form-textarea"
        v-model="(node as any).config.code"
        rows="6"
        placeholder="// your JS code"
      ></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Ambiente de execução</label>
      <select class="form-select" v-model="(node as any).config.world">
        <option value="ISOLATED">ISOLATED</option>
        <option value="MAIN">MAIN</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Momento da execução</label>
      <select class="form-select" v-model="(node as any).config.when">
        <option value="before">before</option>
        <option value="after">after</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Salvar em variável (opcional)</label>
      <input class="form-input" v-model="(node as any).config.saveAs" placeholder="Variável" />
    </div>
    <div class="form-group">
      <label class="form-label">Mapeamento de campos do resultado</label>
      <KeyValueEditor v-model="(node as any).config.assign" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';
import KeyValueEditor from '@/entrypoints/popup/components/builder/components/KeyValueEditor.vue';

defineProps<{ node: NodeBase }>();
</script>

<style scoped></style>
