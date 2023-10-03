import { createApp } from "vue";
import App from "./App.vue";
import { Amplify } from "aws-amplify";
import AmplifyVue from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env
      .VITE_AWS_COGNITO_USER_POOL_USER_CLIENT_ID,
    authenticationFowType: "USER_SRP_AUTH",
  },
});

const app = createApp(App);
app.use(PrimeVue);
app.use(AmplifyVue);

app.component("Button", Button);
app.component("Dialog", Dialog);
app.component("Calendar", Calendar);
app.component("InputText", InputText);
app.component("Card", Card);
app.component("ProgressSpinner", ProgressSpinner);
app.mount("#app");
