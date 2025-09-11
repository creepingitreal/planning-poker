<template>
    <div class="card selected"
         v-if="vote !== null"
    >
        <p v-if="isVisible" >{{ vote }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    vote: {
        type: [Number, null],
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    }
});

</script>