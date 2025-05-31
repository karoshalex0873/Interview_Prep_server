import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
  JoinColumn
} from "typeorm";
import { User } from "./User";
import { Interview } from "./Interview";

// src/Entities/Response.ts
@Entity()
export class InterviewResponse extends BaseEntity {
  @PrimaryGeneratedColumn()
  response_id!: number;

  @Column()
  question!: string;

  @Column('text')
  userResponse!: string;

  @Column('text')
  feedback!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Interview)
  @JoinColumn({ name: "interview_id" })
  interview!: Interview;
}

