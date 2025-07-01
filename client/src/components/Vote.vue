<template>
    <div class="vote-card" v-if="vote !== null">
        <p v-if="visible" >{{ vote }}</p>
    </div>
</template>
<script setup>
const props = defineProps({
    vote: {
        type: [Number, null],
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    }
});

</script>

<style>
.vote-card {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 25px;
    background-color: #693ede; /* Green */
    border: #6999f3 2px solid;
    border-radius: 15px;
    color: white;
    padding: 20px 15px;
    margin: 10px 5px;
    text-decoration: none;
    font-size: 1.2rem;
}

</style>