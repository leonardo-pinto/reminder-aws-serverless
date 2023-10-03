import axios from "axios";
import { Auth } from "aws-amplify";

const httpClient = axios.create({
  baseURL: "https://73no0hex3c.execute-api.us-east-1.amazonaws.com/prod/",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => localStorage.getItem("token");

const authInterceptor = (config: any) => {
  config.headers["Authorization"] = getAuthToken();
  return config;
};

const responseInterceptor = (response: any) => response;

const errorInterceptor = (error: any) => {
  if (error?.response?.status === 401) {
    localStorage.removeItem("token");
    Auth.signOut();
  }
  return Promise.reject(error);
};

httpClient.interceptors.request.use(authInterceptor);
httpClient.interceptors.response.use(responseInterceptor, errorInterceptor);

export default httpClient;
