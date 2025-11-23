from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from .models import Product
import time
import re
import os

def parse_products(query):
    # Очистка таблицы перед новым парсингом
    Product.objects.all().delete()

    options = Options()
    # Если нужно видеть браузер при отладке, установите переменную окружения SHOW_BROWSER=1
    if os.environ.get('SHOW_BROWSER') != '1':
        options.add_argument('--headless')  # Без открытия окна браузера
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    driver = webdriver.Chrome(options=options)
    try:
        page = 1
        products = []
        query_lower = query.lower()
        while page <= 10:
            if page == 1:
                url = f'https://www.wildberries.ru/catalog/0/search.aspx?search={query}'
            else:
                url = f'https://www.wildberries.ru/catalog/0/search.aspx?search={query}&page={page}'
            driver.get(url)
            try:
                # Ожидаем загрузки карточек товаров (контейнеры — article[data-nm-id] или .product-card__wrapper)
                WebDriverWait(driver, 15).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'article[data-nm-id], .product-card__wrapper'))
                )
            except Exception as e:
                print(f"Не удалось дождаться карточек товаров: {e}")
                break
            # --- Автоматическая прокрутка страницы для подгрузки товаров ---
            SCROLL_PAUSE_TIME = 2
            last_height = driver.execute_script("return document.body.scrollHeight")
            for _ in range(10):  # Прокрутить вниз 10 раз
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(SCROLL_PAUSE_TIME)
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break  # если высота не изменилась — больше товаров нет
                last_height = new_height
            # --- Конец прокрутки ---
            html = driver.page_source
            # Сохраняем HTML страницы в отладочный файл, чтобы можно было проинспектировать разметку
            try:
                debug_path = os.path.join(os.path.dirname(__file__), '..', 'wb_debug.html')
                with open(debug_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Сохранён HTML страницы для отладки: {debug_path}")
            except Exception as e:
                print(f"Не удалось сохранить debug HTML: {e}")
            soup = BeautifulSoup(html, 'html.parser')
            items_on_page = 0
            
            # Новые селекторы для актуальной структуры Wildberries (основано на wb_debug.html)
            for item in soup.select('article[data-nm-id], .product-card__wrapper'):
                # Название товара
                title = item.select_one('span.product-card__name, .product-card__name')
                # Цена (нижняя цена — текущая цена, часто в теге <ins class="price__lower-price">)
                price = item.select_one('ins.price__lower-price, .price__lower-price, .price__wrap ins, .price__wrap .price__lower-price')
                # Цена без скидки (если есть)
                discount_price = item.select_one('del, .price__old')
                # Рейтинг
                rating = item.select_one('span.address-rate-mini, .address-rate-mini, .rating')
                # Количество отзывов
                reviews_count = item.select_one('span.product-card__count, .product-card__count, .feedback-count')

                if not (title and price):
                    continue

                title_text = title.get_text(separator=' ', strip=True)
                # Фильтрация по наличию слова из запроса в названии
                if query_lower not in title_text.lower():
                    continue

                try:
                    price_text = price.get_text(' ', strip=True)
                    # Оставляем только цифры и точку
                    price_clean = re.sub(r'[^0-9\.]', '', price_text)
                    price_value = float(price_clean) if price_clean else 0
                except (ValueError, AttributeError):
                    continue

                try:
                    if discount_price:
                        discount_text = discount_price.get_text(' ', strip=True)
                        discount_clean = re.sub(r'[^0-9\.]', '', discount_text)
                        discount_price_value = float(discount_clean) if discount_clean else None
                    else:
                        discount_price_value = None
                except (ValueError, AttributeError):
                    discount_price_value = None

                try:
                    if rating:
                        rating_text = rating.get_text(' ', strip=True).replace(',', '.')
                        rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                        rating_value = float(rating_match.group(1)) if rating_match else 0
                    else:
                        rating_value = 0
                except (ValueError, AttributeError):
                    rating_value = 0

                try:
                    if reviews_count:
                        reviews_text = reviews_count.get_text(' ', strip=True)
                        reviews_digits = re.sub(r'[^0-9]', '', reviews_text)
                        reviews_value = int(reviews_digits) if reviews_digits else 0
                    else:
                        reviews_value = 0
                except (ValueError, AttributeError):
                    reviews_value = 0

                product = Product(
                    title=title_text,
                    price=price_value,
                    discount_price=discount_price_value,
                    rating=rating_value,
                    reviews_count=reviews_value,
                )
                products.append(product)
                items_on_page += 1
            print(f"Страница {page}: найдено товаров для сохранения: {items_on_page}")
            if items_on_page == 0:
                break  # если на странице нет товаров — конец
            page += 1
        if products:
            Product.objects.bulk_create(products)
            print(f"Товары успешно сохранены в базу данных. Всего: {len(products)}")
        else:
            print("Не найдено ни одного подходящего товара для сохранения.")
    finally:
        driver.quit()
