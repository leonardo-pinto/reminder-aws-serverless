export interface Reminder {
  content: string;
  email: string;
  reminderDate: string;
}

export type CreateReminderRequest = Omit<Reminder, "email">;
