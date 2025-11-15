import os
from taskiq_redis import RedisAsyncResultBackend, RedisStreamBroker

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

result_backend = RedisAsyncResultBackend(redis_url=REDIS_URL)
broker = RedisStreamBroker(url=REDIS_URL).with_result_backend(result_backend)
