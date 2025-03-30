import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Interview } from "./Interview";
import { Response } from "./Response";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () =>"CURRENT_TIMESTAMP"
  })
  updatedAt!:Date

  // Relationships
  @OneToMany(() => Interview, (interview) => interview.user)
  interviews!: Interview[];

  @OneToMany(() => Response, (response) => response.user)
  responses!: Response[];
}