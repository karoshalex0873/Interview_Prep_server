import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  OneToMany,
  BaseEntity
} from "typeorm";
import { User } from "./User";
import { Response } from "./Response";

@Entity()
export class Interview extends BaseEntity {
  @PrimaryGeneratedColumn()
  interviewId!: number;

  @Column()
  role!: string;

  @Column()
  level!: string;

  @Column()
  techstack!: string;

  @Column()
  type!: string;

  @Column({ type: 'integer' })
  amount!: number;

  @Column("simple-array")
  questions!: string[];

  // Relationships
  @ManyToOne(() => User, (user) => user.interviews)
  user!: User;

  @OneToMany(() => Response, (response) => response.interview)
  responses!: Response[];
}