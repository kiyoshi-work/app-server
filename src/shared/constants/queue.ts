export const QUEUE_NAME = {
  USER: 'user',
  TELEGRAM_BOT: 'telegram_bot',
};

export const QUEUE_PROCESSOR = {
  USER: {
    TEST: 'test',
    TEST_LOCK_1: 'test_lock_1',
    TEST_LOCK_2: 'test_lock_2',
    TEST_FAIL: 'test_fail',
  },
  TELEGRAM_BOT: {
    POOLING_QUEUE: 'pooling_queue',
    SEND_MESSAGE: 'send_message',
    SEND_PAGE_MESSAGE: 'send_page_message',
    SEND_PHOTO_MESSAGE: 'send_photo_message',
  },
};
