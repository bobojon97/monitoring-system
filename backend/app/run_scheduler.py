import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.tasks.ping_devices import ping_devices_task

logging.basicConfig(level=logging.INFO)

async def send_ping_task():
    await ping_devices_task.kiq()

async def main():
    scheduler = AsyncIOScheduler()

    scheduler.add_job(
        send_ping_task,  # передаём саму async-функцию
        trigger=CronTrigger(minute="*"),
        id="ping-devices-every-minute",
        replace_existing=True,
    )

    scheduler.start()
    logging.info("Scheduler started: ping_devices_task каждые 1 минуту.")

    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        pass

if __name__ == "__main__":
    asyncio.run(main())
