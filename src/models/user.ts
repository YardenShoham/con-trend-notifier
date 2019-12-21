import { id, Repository } from "@yardenshoham/mongodb-typescript";
import { ObjectId } from "mongodb";
import { clientPromise } from "../database/client";
import {
  IsEmail,
  Matches,
  IsOptional,
  IsPhoneNumber,
  IsDefined
} from "class-validator";

/**
 * The interface of a user.
 */
export interface IUser {
  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's password hash.
   */
  _password: string;

  /**
   * The user's phone number. Includes international prefix (e.g. +41, +972).
   */
  phoneNumber?: string;
}

/**
 * A user in the system. A user has an email address and, optionally, a phone number.
 */
export class User {
  /**
   * The id of this document in the database.
   */
  @id
  public _id: ObjectId;

  /**
   * The user's email address.
   */
  @IsDefined()
  @IsEmail()
  public email: string;

  /**
   * The user's username.
   *
   * Min length is 2, max length is 20 and contains letters, numbers, underscores and dashes. Must match the following regular expression: `[a-zA-Z0-9_-]{2, 20}`.
   */
  @IsDefined()
  @Matches(/[a-zA-Z0-9_-]{2, 20}/)
  public username: string;

  /**
   * The user's password hash. Produced from [bcrypt](https://www.npmjs.com/package/bcrypt).
   */
  @IsDefined()
  @Matches(/^\$2[ayb]\$[A-Za-z0-9./]{56}$/)
  private _password: string;

  /**
   * The user's phone number. Includes international prefix (e.g. +41, +972).
   */
  @IsOptional()
  @IsPhoneNumber(null)
  public phoneNumber?: string;

  /**
   * Constructs a new user.
   * @param email The user's email address.
   * @param username The user's username.
   * @param password The user's password.
   * @param phoneNumber The user's phone number.
   */
  constructor(
    email: string,
    username: string,
    password: string,
    phoneNumber?: string
  ) {
    this.email = email;
    this.username = username;
    this.password = password;
    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }
  }

  /**
   * Sets a user's password.
   * @param value The new password.
   */
  public set password(value: string) {
    this._password = value;
  }

  /**
   * Password getter.
   * @returns The user's password.
   */
  public get password(): string {
    return this._password;
  }
}

/**
 * The context from which one could access all [[User]] documents.
 */
export const userDbPromise = (async function() {
  return new Repository<User>(User, await clientPromise, "users");
})();
