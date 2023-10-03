<template>
  <header>
    <img src="../assets/app-logo.png" alt="app logo" />
    <div>
      <p>Hello, {{ props.name }}</p>
      <button id="sign-out-btn">
        <i
          class="pi pi-sign-out"
          style="font-size: 1.5rem"
          @click="$emit('handleSignout')"
        ></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  name: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

header div {
  align-items: center;
  display: flex;
}

img {
  padding: 1rem;
  width: 10rem;
}

#sign-out-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
}
</style>
