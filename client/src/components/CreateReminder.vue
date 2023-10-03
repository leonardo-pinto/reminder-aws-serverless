<template>
  <div class="input-icon-wrapper">
    <i class="pi pi-align-left"></i>
    <InputText
      type="text"
      v-model="reminderContent"
      placeholder="Add content"
    ></InputText>
    <p v-if="errors.content" class="error-message">{{ errors.content }}</p>
  </div>
  <div class="input-icon-wrapper">
    <i class="pi pi-clock"></i>
    <Calendar
      v-model="reminderDate"
      showTime
      hourFormat="12"
      :minDate="minDate"
      placeholder="Select date and time"
    ></Calendar>
    <p v-if="errors.date" class="error-message">{{ errors.date }}</p>
  </div>
  <div id="btn-wrapper">
    <Button label="Save" @click="saveReminder" raised size="small"></Button>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { createReminder } from "../api/reminders.api";
import { CreateReminderRequest } from "../types/reminder";

const reminderContent = ref("");
const reminderDate = ref("");
const minDate = ref(new Date());
const errors: { [key: string]: string } = reactive({});
const emit = defineEmits(["close"]);

function validateEmptyField(value: string, fieldName: string) {
  errors[fieldName] =
    value === ""
      ? `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } can not be empty.`
      : "";
}

function validateAllFormFields() {
  validateEmptyField(reminderContent.value, "content");
  validateEmptyField(reminderDate.value, "date");
}

async function saveReminder() {
  validateAllFormFields();
  if (errors["content"] != "" || errors["date"] != "") {
    return;
  }

  const reminderRequest: CreateReminderRequest = {
    content: reminderContent.value,
    reminderDate: reminderDate.value,
  };
  await createReminder(reminderRequest);
  emit("close");
}
</script>

<style scoped>
i {
  margin-right: 1rem;
}

.input-icon-wrapper {
  margin-bottom: 1rem;
}

#btn-wrapper {
  display: flex;
  justify-content: right;
  margin-top: 1.5rem;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  text-align: center;
}
</style>
