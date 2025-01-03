import { Model, Database } from '@nozbe/watermelondb';
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators';
import User from './user';

export interface CreateExpenseParams {
  amount: number;
  purpose: string;
  userId: string;
  dateAdded?: Date;
}

export interface UpdateExpenseParams {
  amount?: number;
  purpose?: string;
  dateAdded?: Date;
}

export default class Expense extends Model {
  static table = 'expenses';

  static associations = {
    users: { type: 'belongs_to' as const, key: 'created_by' },
  };

  @field('amount') amount!: number;
  @field('purpose') purpose!: string;
  @relation('users', 'created_by') createdBy!: User;
  @date('date_added') dateAdded!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  validateAmount(): void {
    if (this.amount <= 0) {
      throw new Error('Amount must be greater than zero.');
    }
  }

  validatePurpose(): void {
    if (!this.purpose || this.purpose.trim().length === 0) {
      throw new Error('Purpose cannot be empty.');
    }
  }

  validate(): void {
    this.validateAmount();
    this.validatePurpose();
  }

  static async createExpense(
    database: Database,
    { amount, purpose, userId, dateAdded }: CreateExpenseParams
  ): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to create an expense.');
    }

    await database.write(async () => {
      await database.get('expenses').create((expense: Model) => {
        const typedExpense = expense as Expense;
        typedExpense.amount = amount;
        typedExpense.purpose = purpose;
        typedExpense.dateAdded = dateAdded || new Date();
        (typedExpense._raw as any).created_by = userId;
      });
    });
  }

  async updateExpense(updates: UpdateExpenseParams): Promise<void> {
    await this.collection.database.write(async () => {
      await this.update((expense: Expense) => {
        if (updates.amount !== undefined) {
          expense.amount = updates.amount;
        }
        if (updates.purpose !== undefined) {
          expense.purpose = updates.purpose;
        }
        if (updates.dateAdded !== undefined) {
          expense.dateAdded = updates.dateAdded;
        }
      });
    });
    this.validate();
  }

  formatDate(): string {
    return this.dateAdded.toLocaleDateString();
  }
}



