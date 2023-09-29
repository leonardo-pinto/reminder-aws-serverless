<template>
  <nav>Welcome to ReminderApp</nav>
  <Button>Hello World</Button>
  <authenticator
    :services="services"
    :login-mechanisms="['email']"
    :sign-up-attributes="['name']"
  >
    <template v-slot="{ user, signOut }">
      <h1>Hello {{ user.attributes.name }}</h1>
      <button @click="signOut">Sign Out</button>
    </template>
  </authenticator>
</template>

<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import { Auth } from "aws-amplify";

const services = {
  async handleSignIn(formData: any) {
    console.log("handle sign in");
    console.log(formData);
    const input = {
      username: formData.username as string,
      password: formData.password as string,
    };
    const result = await Auth.signIn(input);
    console.log(`RESULT SIGN IN: ${result.signInUserSession.idToken.jwtToken}`);
    return result;
  },
};
</script>
