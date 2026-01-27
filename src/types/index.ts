export * from "./vehicle";

// User Interface
export interface User {
  id: number;
  companyId: number | null;
  company: null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idCard: string;
  role: number;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  updatedAt: string;
}


