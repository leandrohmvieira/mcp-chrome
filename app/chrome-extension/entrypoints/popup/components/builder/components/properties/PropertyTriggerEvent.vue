<template>
  <div>
    <SelectorEditor :node="node" :allowPick="true" />
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">Tipo de evento</label>
        <input
          class="form-input"
          v-model="(node as any).config.event"
          placeholder="Ex.: input/change/mouseover"
        />
      </div>
      <div class="form-group checkbox-group">
        <label class="checkbox-label"
          ><input type="checkbox" v-model="(node as any).config.bubbles" /> Propagar</label
        >
        <label class="checkbox-label"
          ><input type="checkbox" v-model="(node as any).config.cancelable" /> Cancelável</label
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import type { NodeBase } from '@/entrypoints/background/record-replay/types';
import SelectorEditor from './SelectorEditor.vue';

defineProps<{ node: NodeBase }>();
</script>

<style scoped></style>
