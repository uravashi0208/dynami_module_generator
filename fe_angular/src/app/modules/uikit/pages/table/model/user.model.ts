export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  selected: boolean;
  status: number;
  createdAt: string;
}
