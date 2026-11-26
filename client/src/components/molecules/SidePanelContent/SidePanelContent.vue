<template>
  <div class="content-item" :class="[title.toLowerCase(), { active }]">
    <div class="content-title" @click="$emit('openPanel')">
      <Icon :name="iconName" class-name="icon small" />
      <Transition name="side-panel-fade">
        <h2 v-if="showPanel" class="title">{{title}}</h2>
      </Transition>
    </div>

    <Transition
      name="side-panel-expand"
      @before-enter="collapseHeight"
      @enter="expandHeight"
      @after-enter="clearHeight"
      @leave="shrinkHeight"
      @after-leave="clearHeight"
    >
      <div v-if="showPanel" class="content-body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  showPanel: {
    type: Boolean,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // Highlights sections that represent the screen currently on display.
  active: {
    type: Boolean,
    default: false,
  },
//   openPanel: {
//     type: Boolean,
//     required: true,
//   },
});

const emits = defineEmits(['openPanel']);

// Height can't transition to or from `auto`, so the body is animated between
// 0 and its measured height, letting the sections below glide rather than jump.
function collapseHeight(el) {
  el.style.height = '0px'
}

function expandHeight(el) {
  void el.offsetHeight
  el.style.height = `${el.scrollHeight}px`
}

function shrinkHeight(el) {
  el.style.height = `${el.scrollHeight}px`
  void el.offsetHeight
  el.style.height = '0px'
}

function clearHeight(el) {
  el.style.height = ''
}
</script>
