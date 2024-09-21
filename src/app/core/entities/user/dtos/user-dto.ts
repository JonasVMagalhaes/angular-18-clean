import { UserResponse } from "@entities/user/models/user-response.interface";

export class User {
    id: string;

    constructor(user: UserResponse) {
        this.id = user.id;
    }

    from(user: UserResponse): User  {
        return new User(user);
    }
}