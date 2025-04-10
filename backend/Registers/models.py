from django.db import models

# Create your models here.
from pynamodb.models import Model 
from pynamodb.attributes import UnicodeAttribute,NumberAttribute,BooleanAttribute,ListAttribute
from django.conf import settings


class UserCart(Model):

    class Meta:
        table_name = "UserCart"
        region = settings.AWS_REGION_NAME
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

    user_id = UnicodeAttribute(hash_key=True)
    product_ids = ListAttribute(of=UnicodeAttribute)

    def __str__(self):
        return f"{self.user_id} cart: {self.product_ids}"

if not UserCart.exists():
    UserCart.create_table(read_capacity_units=5, write_capacity_units=5, wait=True)
    print("UserCart Table created successfully!")
else:
    print("UserCart Table already exists.")
    
