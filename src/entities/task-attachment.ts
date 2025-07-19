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
 * Represents a file attachment for a task.
 */
@Entity("task_attachments")
export class TaskAttachment {
  @PrimaryGeneratedColumn({ name: 'attachment_id' })
  attachmentId!: number;

  @Column({ 
    name: 'task_id',
    type: 'integer',
    nullable: false
  })
  taskId!: number;

  @Column({ 
    name: 'file_name',
    type: 'character varying',
    length: 255,
    nullable: false
  })
  fileName!: string;

  @Column({ 
    name: 'file_path',
    type: 'text',
    nullable: false
  })
  filePath!: string;

  @Column({ 
    name: 'file_type',
    type: 'character varying',
    length: 100, 
    nullable: true 
  })
  fileType?: string;

  @Column({ 
    name: 'file_size', 
    type: 'integer', 
    nullable: true 
  })
  fileSize?: number;

  @Column({ 
    name: 'uploaded_by',
    type: 'integer',
    nullable: false
  })
  uploadedById!: number;

  @CreateDateColumn({ 
    name: 'uploaded_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  uploadedAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('Task', 'attachments')
  @JoinColumn({ name: 'task_id' })
  task?: any; // Using 'any' to avoid circular dependency

  @ManyToOne('User', 'uploadedAttachments')
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy?: any; // Using 'any' to avoid circular dependency

  /**
   * Creates a new task attachment.
   * @param taskId - The ID of the task this attachment belongs to.
   * @param uploadedById - The ID of the user who uploaded the attachment.
   * @param fileName - The name of the file.
   * @param filePath - The path to the file.
   * @param fileType - The MIME type of the file.
   * @param fileSize - The size of the file in bytes.
   * @returns A new TaskAttachment instance.
   */
  static createAttachment(
    taskId: number,
    uploadedById: number,
    fileName: string,
    filePath: string,
    fileType?: string,
    fileSize?: number
  ): TaskAttachment {
    const attachment = new TaskAttachment();
    attachment.taskId = taskId;
    attachment.uploadedById = uploadedById;
    attachment.fileName = fileName;
    attachment.filePath = filePath;
    if (fileType) attachment.fileType = fileType;
    if (fileSize) attachment.fileSize = fileSize;
    return attachment;
  }
}
