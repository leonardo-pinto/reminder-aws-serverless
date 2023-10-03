<template>
  <Card>
    <template #content>
      <div class="data-wrapper">
        <i class="pi pi-align-left"></i>
        <p>{{ props.content }}</p>
      </div>
      <div class="data-wrapper">
        <i class="pi pi-clock"></i>
        <p>
          {{
            new Date(props.date).toLocaleTimeString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          }}
        </p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  content: string;
  date: string;
}

const props = defineProps<Props>();
</script>

<style scoped>
div.p-card.p-component {
  margin: 0.5rem auto;
  width: 80%;
}

.data-wrapper {
  align-items: center;
  display: flex;
  justify-content: left;
}

.data-wrapper i {
  margin-right: 1rem;
}
</style>
