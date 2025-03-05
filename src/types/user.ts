// src/types/user.ts
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  height: number;
  weight: number;
  bmi: number;
  goalType: 'weight_loss' | 'weight_gain' | 'maintain';
  createdAt: Date;
  updatedAt: Date;
}
