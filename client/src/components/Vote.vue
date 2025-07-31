<template>
    <div class="flex justify-center items-center w-[20px] h-[25px] bg-[#693ede] border-[2px] border-[#6999f3] rounded-[15px] text-white px-[15px] py-[20px] mx-[5px] my-[10px] no-underline text-[1.2rem]"
         v-if="vote !== null"
    >
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