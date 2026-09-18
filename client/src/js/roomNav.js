import { ref, watch } from "vue";

// Shared between Room.vue and App.vue so the tool tabs can render as a
// full-width subnav directly under the main site nav, rather than being
// scoped inside the room's boxed content layout.
export const activeTool = ref("poker");
export const showToolSubnav = ref(false);

// Tracks the room the user is currently in so the logo can route back to
// that room's dashboard instead of always resetting to the join screen.
export const currentRoom = ref({ roomId: "", roomName: "" });

export const setCurrentRoom = (roomId, roomName) => {
  currentRoom.value = { roomId, roomName };
};

export const clearCurrentRoom = () => {
  currentRoom.value = { roomId: "", roomName: "" };
};

const ACTIVE_TOOL_KEY_PREFIX = "poker_active_tool_";

// Restores the previously selected tool for a room (e.g. after a page refresh)
// and keeps localStorage in sync as the user switches tabs.
export const restoreActiveTool = (roomId, requestedTool) => {
  if (["poker", "retro", "wheel"].includes(requestedTool)) {
    activeTool.value = requestedTool;
    return;
  }

  const saved =
    roomId && localStorage.getItem(`${ACTIVE_TOOL_KEY_PREFIX}${roomId}`);
  activeTool.value = saved === "retro" ? "retro" : "poker";
};

let unwatch = null;

export const persistActiveTool = (roomId) => {
  unwatch?.();
  if (!roomId) return;

  unwatch = watch(activeTool, (tool) => {
    localStorage.setItem(`${ACTIVE_TOOL_KEY_PREFIX}${roomId}`, tool);
  });
};
