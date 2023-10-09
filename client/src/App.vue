<template>
  <authenticator
    :services="services"
    :login-mechanisms="['email']"
    :sign-up-attributes="['name']"
    :key="`authenticator-${updatedAt}`"
  >
    <template v-slot="{ signOut, user }">
      <TheHeader
        @handle-signout="signOut"
        :name="user.attributes.name"
      ></TheHeader>
      <Button
        id="open-dialog-btn"
        label="Create new reminder"
        size="small"
        icon="pi pi-calendar-times"
        @click="showCreateReminder = true"
      ></Button>
      <Dialog
        v-model:visible="showCreateReminder"
        modal
        header="Create new reminder"
        id="dialog"
      >
        <CreateReminder
          @close="showCreateReminder = false"
          @created="updateKey"
        ></CreateReminder
      ></Dialog>
      <RemindersList :key="updatedAt"></RemindersList>
      <TheFooter></TheFooter>
    </template>
  </authenticator>
</template>

<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import { Auth } from "aws-amplify";
import TheHeader from "./layout/TheHeader.vue";
import TheFooter from "./layout/TheFooter.vue";
import RemindersList from "./components/RemindersList.vue";
import CreateReminder from "./components/CreateReminder.vue";
import { SignIn, SignUp, SignUpConfirmation } from "./types/auth";
import { ref } from "vue";

let tempPassword = "";

const services = {
  async handleSignIn(formData: SignIn) {
    const result = await Auth.signIn(formData);
    tempPassword = formData.password;
    localStorage.setItem("token", result.signInUserSession.idToken.jwtToken);
  },
  async handleSignUp(formData: SignUp) {
    tempPassword = formData.password;
    const result = await Auth.signUp(formData);
    return result;
  },
  async handleConfirmSignUp(input: SignUpConfirmation) {
    const { username, code } = input;
    await Auth.confirmSignUp(username, code);
    const result = await Auth.signIn(username, tempPassword);
    tempPassword = "";
    localStorage.setItem("token", result.signInUserSession.idToken.jwtToken);
    updateKey(); // updates component key to redirect to app
    return result;
  },
};
const updatedAt = ref("");
const showCreateReminder = ref(false);

// Method create to force components RemindersList re-render
// when a reminder is created, so the reminders list is automatically updated
function updateKey() {
  updatedAt.value = new Date().toString();
}
</script>

<style>
#open-dialog-btn {
  display: flex;
  margin: 0 auto;
}
</style>
