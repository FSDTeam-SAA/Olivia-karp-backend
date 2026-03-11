import { User } from "../modules/user/user.interface";

declare global {
  namespace Express {
    interface User {
      email: string;
      _id: string;
    }
  }
}
