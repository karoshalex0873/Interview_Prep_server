import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  BaseEntity
} from "typeorm";
import { User } from "./User";
import { Interview } from "./Interview";

@Entity()
export class Response extends BaseEntity {
  @PrimaryGeneratedColumn()
  responseId!: number;

  @Column()
  questionText!: string;

  @Column('text')
  userResponse!: string;

  @Column('simple-array')
  feedback!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.responses)
  user!: User;

  @ManyToOne(() => Interview, (interview) => interview.responses)
  interview!: Interview;
}