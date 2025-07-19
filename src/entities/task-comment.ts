import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

/**
 * Represents a comment on a task.
 */
@Entity("task_comments")
export class TaskComment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  commentId!: number;

  @Column({ 
    name: 'task_id',
    type: 'integer',
    nullable: false
  })
  taskId!: number;

  @Column({ 
    name: 'user_id',
    type: 'integer',
    nullable: false
  })
  userId!: number;

  @Column({ 
    name: 'content',
    type: 'text',
    nullable: false
  })
  content!: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('Task', 'comments')
  @JoinColumn({ name: 'task_id' })
  task?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'taskComments')
  @JoinColumn({ name: 'user_id' })
  user?: any; // Using 'any' to avoid circular dependency

  /**
   * Creates a new task comment.
   * @param taskId - The ID of the task this comment belongs to.
   * @param userId - The ID of the user who created the comment.
   * @param content - The content of the comment.
   * @returns A new TaskComment instance.
   */
  static createComment(taskId: number, userId: number, content: string): TaskComment {
    const comment = new TaskComment();
    comment.taskId = taskId;
    comment.userId = userId;
    comment.content = content;
    return comment;
  }

  /**
   * Updates the content of the comment.
   * @param newContent - The new content for the comment.
   */
  updateContent(newContent: string): void {
    this.content = newContent;
  }
}
