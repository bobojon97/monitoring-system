FROM python:3.11-slim

WORKDIR /app

# Устанавливаем uv
RUN pip install --no-cache-dir uv

# Копируем requirements.txt
COPY requirements.txt .

# Устанавливаем зависимости с помощью uv в системную среду
RUN uv pip install --system -r requirements.txt

# Копируем приложение
COPY ./app ./app

# Запускаем Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]