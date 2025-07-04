from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from .models import Product
import time

def parse_products(query):
    # Очистка таблицы перед новым парсингом
    Product.objects.all().delete()

    options = Options()
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
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '.product-card__wrapper'))
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
            soup = BeautifulSoup(html, 'html.parser')
            items_on_page = 0
            for item in soup.select('.product-card__wrapper'):
                title = item.select_one('.product-card__name')
                price = item.select_one('.price__lower-price')
                discount_price = item.select_one('del')
                rating = item.select_one('.address-rate-mini')
                reviews_count = item.select_one('.product-card__count')

                if not (title and price and rating and reviews_count):
                    continue

                title_text = title.text.strip()
                # Фильтрация по наличию слова из запроса в названии
                if query_lower not in title_text.lower():
                    continue

                price_value = float(price.text.strip().replace('₽','').replace('\xa0','').replace(' ',''))
                discount_price_value = float(discount_price.text.strip().replace('₽', '').replace('\xa0','').replace(' ', '')) if discount_price else None
                rating_text = rating.text.strip().replace(',', '.')
                try:
                    rating_value = float(rating_text)
                except ValueError:
                    continue  # если рейтинг не число — пропустить товар
                if rating_value is None:
                    continue  # если рейтинг не определён — пропустить товар
                reviews_text = reviews_count.text.strip().replace('\xa0','').replace(' ', '')
                try:
                    reviews_value = int(''.join(filter(str.isdigit, reviews_text)))
                except ValueError:
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
