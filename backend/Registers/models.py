from django.db import models

# Create your models here.
from pynamodb.models import Model 
from pynamodb.attributes import UnicodeAttribute,NumberAttribute,BooleanAttribute,ListAttribute
from django.conf import settings
from pynamodb.attributes import (
    UnicodeAttribute,
    MapAttribute,
    ListAttribute,
    UTCDateTimeAttribute
)
from datetime import datetime
import uuid


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
    
# Define the structure of each product detail
class ProductDetail(MapAttribute):
    product_id = UnicodeAttribute()
    product_name = UnicodeAttribute()
    product_color = UnicodeAttribute()
    product_size = UnicodeAttribute(null=True)
    product_price = UnicodeAttribute(null=True)
    image_url = UnicodeAttribute(null=True)


# Main Checkout model
class Checkout(Model):
    class Meta:
        table_name = "Checkouts"
        region = settings.AWS_REGION_NAME
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

    checkout_id = UnicodeAttribute(hash_key=True, default_for_new=lambda: str(uuid.uuid4()))
    created_at = UTCDateTimeAttribute(default=datetime.utcnow)
    username = UnicodeAttribute()
    phone_number = UnicodeAttribute()
    login_email = UnicodeAttribute()
    product_details = ListAttribute(of=ProductDetail)
    payment_type = UnicodeAttribute()  # "upi", "card", or "cod"
    created_at = UTCDateTimeAttribute(default=datetime.utcnow)

    def __str__(self):
        return f"Checkout by {self.username} with {len(self.product_details)} product(s)"

if not Checkout.exists():
    Checkout.create_table(read_capacity_units=5, write_capacity_units=5, wait=True)
    print("ProductDetail Table created successfully!")
else:
    print("ProductDetail Table already exists.")