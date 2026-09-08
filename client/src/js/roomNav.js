import { ref } from 'vue';

// Shared between Room.vue and App.vue so the tool tabs can render as a
// full-width subnav directly under the main site nav, rather than being
// scoped inside the room's boxed content layout.
export const activeTool = ref('poker');
export const showToolSubnav = ref(false);
