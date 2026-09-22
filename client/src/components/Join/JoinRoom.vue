<template>
  <section>
    <div class="room join-room">
      <div class="section-title">
        <h1 class="title">
          {{ roomId ? roomName || "Join Room" : "Join or Create a Room" }}
        </h1>

        <input
          v-if="!roomId"
          v-model="roomNameInput"
          placeholder="Sprint Name"
          @keyup.enter="joinRoom"
        />

        <input
          v-model="name"
          type="text"
          placeholder="Username *"
          @keyup.enter="joinRoom"
        />
      </div>

      <div class="button-section">
        <button @click="joinRoom">Join</button>

        <div v-if="!roomId" class="container-create-btn">
          <input
            id="invite-only"
            type="checkbox"
            v-model="locked"
            class="checkbox"
          />
          <label for="invite-only"> Invite-only </label>
          <p v-if="locked" class="text-small confirmation-text">
            By checking this box, only users with the share link will be able to
            join the room
          </p>
          <button @click="createRoom" class="secondary-blue">
            Create Room
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import socket from "../../../socket.js";
  import "./join-room.css";
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { generateRoomId, randomNameGenerator } from "../../js/generators.js";
  import { useRoute, useRouter } from "vue-router";
  import { setCurrentRoom } from "../../js/roomNav.js";

  const route = useRoute(false);
  const router = useRouter();

  const roomId = computed(() => route.params.roomId || "");
  const roomName = ref("");

  const name = ref("");
  const room = ref({
    roomId: "",
    roomName: "",
  });
  const roomNameInput = ref("");
  const locked = ref(false);
  const isCreating = ref(false);

  const saveSession = (roomData, userName) => {
    localStorage.setItem(
      `poker_session_${roomData.roomId}`,
      JSON.stringify({
        room: roomData,
        name: userName,
        savedAt: Date.now(),
      }),
    );
  };

  const joinRoom = () => {
    if (!name.value) {
      alert("Please enter your name");
      return;
    }

    if (!roomId.value && !roomNameInput.value) {
      alert("Please enter a room name");
      return;
    }

    isCreating.value = false;
    socket.emit("joinRoom", {
      room: {
        roomId: roomId.value,
        roomName: roomId.value ? "" : roomNameInput.value,
      },
      user: name.value,
      fromLink: !!roomId.value,
    });
  };

  const createRoom = () => {
    if (!name.value) {
      alert("Please enter your name");
      return;
    }

    room.value.roomName = roomNameInput.value || randomNameGenerator();
    room.value.roomId = generateRoomId();
    isCreating.value = true;

    socket.emit("createRoom", {
      room: { ...room.value, locked: locked.value },
      user: name.value,
    });

    locked.value = false;
  };

  const handleRoomJoined = ({ roomId, roomName }) => {
    room.value.roomId = roomId;
    room.value.roomName = roomName;

    saveSession(room.value, name.value);
    setCurrentRoom(roomId, roomName);

    if (isCreating.value) {
      isCreating.value = false;
      router.push({
        path: "/dashboard",
        query: { roomId, roomName },
      });
      return;
    }

    const selectedTool = route.query.tool;
    const toolQuery = selectedTool
      ? `?tool=${encodeURIComponent(selectedTool)}`
      : "";
    router.push(`/room/${roomId}${toolQuery}`);
  };

  const handleRoomError = ({ message }) => {
    alert(message);
  };

  const handleRoomNameResolved = ({ roomName: resolvedName, error }) => {
    if (!error) {
      roomName.value = resolvedName;
    }
  };

  socket.on("roomJoined", handleRoomJoined);
  socket.on("roomError", handleRoomError);
  socket.on("roomNameResolved", handleRoomNameResolved);

  onMounted(() => {
    if (roomId.value) {
      socket.emit("getRoomName", roomId.value);
    }
  });

  onUnmounted(() => {
    socket.off("roomJoined", handleRoomJoined);
    socket.off("roomError", handleRoomError);
    socket.off("roomNameResolved", handleRoomNameResolved);
  });
</script>
