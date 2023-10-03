import { CreateReminderRequest, Reminder } from "../types/reminder";
import httpClient from "./httpClient";
const REMINDERS_ROUTE = "/reminders";

const getAllReminders = async (): Promise<Reminder[]> => {
  const res = await httpClient.get<Reminder[]>(REMINDERS_ROUTE);
  return res.data;
};

const createReminder = async (
  reminder: CreateReminderRequest
): Promise<Reminder> => {
  const res = await httpClient.post<Reminder>(REMINDERS_ROUTE, reminder);
  return res.data;
};

export { getAllReminders, createReminder };
