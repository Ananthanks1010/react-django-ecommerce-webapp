from django.db import models

# Create your models here.
from pynamodb.models import Model 
from pynamodb.attributes import UnicodeAttribute,NumberAttribute,BooleanAttribute,ListAttribute
from django.conf import settings


class Product(Model):

    class Meta:
        table_name = "Products"
        region = settings.AWS_REGION_NAME
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

    product_id = UnicodeAttribute(hash_key=True)
    product_name = UnicodeAttribute()
    product_price = NumberAttribute()
    product_category = UnicodeAttribute()
    product_color = UnicodeAttribute()
    product_description = UnicodeAttribute()
    product_sizes = ListAttribute(of=UnicodeAttribute,null=True)
    isTrending = BooleanAttribute(default=False)  # New Boolean Field
    isFeatured = BooleanAttribute(default=False)  # New Boolean Field  # Image Fields
    image_url = UnicodeAttribute(null=True)
    thumbnail_url = ListAttribute(of=UnicodeAttribute, null=True)
    model_url = UnicodeAttribute(null=True)

    def __str__(self):
        return f"{self.product_name} ({self.product_category})"

if not Product.exists():
    Product.create_table(read_capacity_units=5, write_capacity_units=5, wait=True)
    print("Table created successfully!")
else:
    print("Table already exists.")
    
