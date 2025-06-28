from django.db import models


class Product(models.Model):
    title = models.CharField(max_length=255)
    price = models.FloatField()
    discount_price = models.FloatField(null=True, blank=True)
    rating = models.FloatField()
    reviews_count = models.IntegerField()

    def __str__(self):
        return self.title if self.title is not None else ""