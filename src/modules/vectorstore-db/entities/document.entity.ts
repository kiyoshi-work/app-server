import { Entity, Column, PrimaryGeneratedColumn, EntitySchema } from 'typeorm';

// export const DocumentSchema = new EntitySchema<DocumentEntity>({
//   name: 'documents',
//   columns: {
//     id: {
//       generated: 'uuid',
//       type: 'uuid',
//       primary: true,
//     },
//     pageContent: {
//       type: String,
//     },
//     metadata: {
//       type: 'jsonb',
//     },
//     embedding: {
//       type: String,
//     },
//   },
// });
@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pageContent?: string;

  @Column({ type: 'jsonb' })
  metadata: string;

  @Column()
  embedding: string;
}
