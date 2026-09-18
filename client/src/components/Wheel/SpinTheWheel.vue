<template>
  <VueWheelSpinner
    ref="spinner"
    :slices="slices"
    :slice-font-style="sliceFontStyle"
    :slice-text-position="sliceTextPosition"
    :winner-index="defaultWinner"
    :cursor-angle="cursorAngle"
    :cursor-position="cursorPosition"
    :cursor-distance="cursorDistance"
    @spin-start="onSpinStart"
    @spin-end="onSpinEnd"
  >
    <template #default>
      <button
        class="spin-button"
        :disabled="isSpinning"
        @click="handleSpinButtonClick"
      >
        Spin
      </button>
    </template>
  </VueWheelSpinner>
</template>

<script>
import VueWheelSpinner from "vue-wheel-spinner";
import "./spin-the-wheel.css";

export default {
  components: {
    VueWheelSpinner,
  },
  data() {
    return {
      winnerResult: null,
      slices: [
        { color: "#eb4d4b", text: "Slice 1", textColor: "#000000" },
        { color: "#f0932b", text: "Slice 2", textColor: "#ffffff" },
        { color: "#f9ca24", text: "Slice 3", textColor: "#000000" },
        { color: "#badc58", text: "Slice 4", textColor: "#ffffff" },
        { color: "#7ed6df", text: "Slice 5", textColor: "#000000" },
        { color: "#e056fd", text: "Slice 6", textColor: "#ffffff" },
      ],
      sliceFontStyle: "bold 16px Arial",
      sliceTextPosition: "edge",
      isSpinning: false,
      defaultWinner: 0,
      cursorAngle: 0,
      cursorPosition: "edge",
      cursorDistance: 0,
    };
  },
  methods: {
    handleSpinButtonClick() {
      this.$refs.spinner.spinWheel(this.defaultWinner);
    },
    spinFor(index) {
      this.defaultWinner = index;
      this.$refs.spinner.spinWheel(index);
    },
    onSpinStart() {
      this.winnerResult = null;
      this.isSpinning = true;
    },
    onSpinEnd(winnerIndex) {
      this.isSpinning = false;
      this.winnerResult = this.slices[winnerIndex];
    },
  },
};
</script>
