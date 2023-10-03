<template>
  <div id="reminders-list-wrapper">
    <h2>My Reminders</h2>
    <div id="progress-spinner-wrapper" v-if="isLoading">
      <ProgressSpinner
        style="width: 5rem; height: 5rem; margin: 0 auto"
      ></ProgressSpinner>
    </div>
    <div v-else-if="reminders.length && !isLoading">
      <div v-for="(reminder, index) in reminders" :key="index">
        <ReminderCard
          :content="reminder.content"
          :date="reminder.reminderDate"
        ></ReminderCard>
      </div>
    </div>
    <div v-else>There are no reminders</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getAllReminders } from "../api/reminders.api";
import { Reminder } from "../types/reminder";
import ReminderCard from "./ReminderCard.vue";

const reminders = ref<Reminder[]>([]);
const isLoading = ref(false);

async function getReminders() {
  try {
    isLoading.value = true;
    reminders.value = await getAllReminders();
  } catch (error) {
    console.error(`An error occurred while fetching reminders::: ${error}`);
  } finally {
    isLoading.value = false;
  }
}

getReminders();
</script>

<style scoped>
#reminders-list-wrapper {
  margin: 2rem auto 4rem;
  width: 50vw;
}

#progress-spinner-wrapper {
  display: flex;
  justify-content: center;
}

h2 {
  color: #6366f1;
  text-align: center;
}
</style>
