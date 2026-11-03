<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">Sequência de teclas</label>
      <input
        class="form-input"
        v-model="(node as any).config.keys"
        placeholder="Ex.: Backspace Enter ou cmd+a"
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
