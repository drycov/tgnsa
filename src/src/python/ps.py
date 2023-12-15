import random

def generate_duty():
    duty = {}
    year = 2022

    while year == 2022:  # Генерация только для 2022 года
        duty[str(year)] = {}
        for month in range(1, 13):  # Генерация для каждого месяца
            days_in_month = 31 if month in [1, 3, 5, 7, 8, 10, 12] else 30 if month != 2 else 28
            duty[str(year)][str(month).zfill(2)] = {}
            
            day = 1
            while day <= days_in_month:  # Генерация для каждого дня месяца
                if random.random() < 0.3:  # 30% вероятности "3"
                    consecutive_3 = random.randint(12, 28)  # Не менее 12, но не более 28 дней "3" подряд
                    for _ in range(consecutive_3):
                        if day > days_in_month:
                            break
                        duty[str(year)][str(month).zfill(2)][str(day).zfill(2)] = "3"
                        day += 1
                else:
                    duty[str(year)][str(month).zfill(2)][str(day).zfill(2)] = random.choice(["0", "1"])
                    day += 2  # "0" и "1" чередуются через 2 дня
                    
    return duty
# Генерация данных
duty_data = generate_duty()

# Вывод сгенерированных данных
print(duty_data)
