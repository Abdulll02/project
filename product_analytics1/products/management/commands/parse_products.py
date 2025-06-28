from django.core.management.base import BaseCommand
from products.parser import parse_products

class Command(BaseCommand):
    help = 'Парсит товары с Wildberries по заданному запросу (категории или ключевому слову)'

    def add_arguments(self, parser):
        parser.add_argument('query', type=str, help='Категория или поисковый запрос')

    def handle(self, *args, **options):
        query = options['query']
        self.stdout.write(self.style.SUCCESS(f'Запуск парсинга для запроса: {query}'))
        parse_products(query)
        self.stdout.write(self.style.SUCCESS('Парсинг завершён!'))
