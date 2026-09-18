<template>
  
<template>

  <VueWheelSpinner
      ref="spinner"
      :slices="slices"
      :slice-font-style="sliceFontStyle"
      :slice-text-position="sliceTextPosition"
      :winner-index="defaultWinner"
      :sounds="sounds"
      :cursor-angle="cursorAngle"
      :cursor-position="cursorPosition"
      :cursor-distance="cursorDistance"
      @spin-start="onSpinStart"
      @spin-end="onSpinEnd">

    <template #cursor>
      <img class="cursor-img" :src="cursorImage" alt="Cursor">
    </template>

    <template #default>
      <button
          class="spin-button"
          :disabled="isSpinning"
          @click="handleSpinButtonClick"
          @mouseover="handleSpinButtonHover"
          @mouseleave="handleSpinButtonLeave">
        Spin
      </button>
    </template>

  </VueWheelSpinner>

</template>

<script>
  import VueWheelSpinner from 'vue-wheel-spinner';

  import cursorImage from './assets/cursor.svg';
  import wonSound from './sounds/won.mp3';
  import clickSound from './sounds/click.mp3';
  import hoverSound from './sounds/hover.mp3';
  import leaveSound from './sounds/leave.mp3';
  import spinningSound from './sounds/spinning.mp3';

  export default {
    components: {
      VueWheelSpinner
    },
    data() {
      return {
        winnerResult: null,
        slices: [
          {color: '#eb4d4b', text: 'Slice 1', textColor: '#000000'},
          {color: '#f0932b', text: 'Slice 2', textColor: '#ffffff'},
          {color: '#f9ca24', text: 'Slice 3', textColor: '#000000'},
          {color: '#badc58', text: 'Slice 4', textColor: '#ffffff'},
          {color: '#7ed6df', text: 'Slice 5', textColor: '#000000'},
          {color: '#e056fd', text: 'Slice 6', textColor: '#ffffff'},
        ],
        sliceFontStyle: 'bold 16px Arial',
        sliceTextPosition: 'edge',
        isSpinning: false,
        defaultWinner: 0,
        sounds: {
          won: wonSound,
          spinButtonClick: clickSound,
          spinButtonHover: hoverSound,
          spinButtonLeave: leaveSound,
          spinning: spinningSound
        },
        cursorImage,
        cursorAngle: 0,
        cursorPosition: 'edge',
        cursorDistance: 0
      };
    },
    methods: {
      playAudio(audio) {
        if (audio) {
          audio.volume = 0.5
          audio.play();
        }
      },
      handleSpinButtonClick() {
        if (this.buttonClickAudio) {
          this.playAudio(this.buttonClickAudio)
        }
        this.$refs.spinner.spinWheel(this.defaultWinner);
      },
      handleSpinButtonHover() {
        if (this.buttonHoverAudio) {
          this.playAudio(this.buttonHoverAudio)
        }
      },
      handleSpinButtonLeave() {
        if (this.buttonLeaveAudio) {
          this.playAudio(this.buttonLeaveAudio)
        }
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
      }
    },
    mounted() {
      this.buttonHoverAudio = new Audio(hoverSound);
      this.buttonLeaveAudio = new Audio(leaveSound);
      this.buttonClickAudio = new Audio(clickSound);
    }
  };
</script>

</template>
<script setup>
import VueWheelSpinner from 'vue-wheel-spinner';
import 'src/css/spin-the-wheel.css';
// import cusrsorImage from 'assets/cursor.png'

const components = {
  VueWheelSpinner
}

</script>
