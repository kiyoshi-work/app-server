import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { RedisStreamsService } from '../services/redis-streams.service';

@Injectable()
export class RedisStreamsExampleService {
  private readonly logger = new Logger(RedisStreamsExampleService.name);

  constructor(private readonly redisStreamsService: RedisStreamsService) {}

  // Example: Send a message and wait for response
  async createUser(userData: { name: string; email: string }) {
    this.logger.log('Creating user via Redis Streams...');

    try {
      const result = await this.redisStreamsService.send(
        'user.create',
        userData,
      );
      this.logger.log('User created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  // Example: Emit an event (fire and forget)
  async updateUser(userId: string, updateData: any) {
    this.logger.log('Updating user via Redis Streams...');

    this.redisStreamsService.emit('user.update', {
      userId,
      ...updateData,
      timestamp: new Date().toISOString(),
    });

    this.logger.log('User update event emitted');
  }

  // Example: Send notification
  async sendNotification(notification: {
    userId: string;
    message: string;
    type: string;
  }) {
    this.logger.log('Sending notification via Redis Streams...');

    this.redisStreamsService.emit('notification.send', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    this.logger.log('Notification sent');
  }

  // Message Handlers
  @MessagePattern('user.create')
  async handleUserCreate(data: { name: string; email: string }) {
    this.logger.log('Handling user creation:', data);

    // Simulate user creation logic
    const userId = Math.random().toString(36).substr(2, 9);
    const user = {
      id: userId,
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    this.logger.log('User created with ID:', userId);
    return { success: true, user };
  }

  @EventPattern('user.update')
  async handleUserUpdate(data: { userId: string; [key: string]: any }) {
    this.logger.log('Handling user update event:', data);

    // Simulate user update logic
    this.logger.log(`User ${data.userId} updated at ${data.timestamp}`);
  }

  @EventPattern('notification.send')
  async handleNotificationSend(data: {
    userId: string;
    message: string;
    type: string;
    timestamp: string;
  }) {
    this.logger.log('Handling notification send event:', data);

    // Simulate notification sending logic
    this.logger.log(
      `Sending ${data.type} notification to user ${data.userId}: ${data.message}`,
    );
  }

  // Example: Batch processing
  async processBatch(users: Array<{ name: string; email: string }>) {
    this.logger.log(`Processing batch of ${users.length} users...`);

    const promises = users.map((user) => this.createUser(user));
    const results = await Promise.allSettled(promises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(
      `Batch processing completed: ${successful} successful, ${failed} failed`,
    );

    return { successful, failed, results };
  }
}


