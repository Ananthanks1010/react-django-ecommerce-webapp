from django.db import models
from pynamodb.models import Model 
from pynamodb.attributes import UnicodeAttribute
from django.conf import settings


class UserModel(Model):
    class Meta:
        table_name = "UserTable"
        region = settings.AWS_REGION_NAME
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

    # Keys and Attributes
    user_id = UnicodeAttribute(hash_key=True)   # Primary Key
    user_name = UnicodeAttribute()
    email = UnicodeAttribute()
    password = UnicodeAttribute()

    def __str__(self):
        return f"{self.user_id} ({self.user_name})"

    @classmethod
    def get_or_none(cls, email):
        for user in cls.scan(UserModel.email == email):
            return user
        return None


# Create table if it doesn't exist
if not UserModel.exists():
    UserModel.create_table(read_capacity_units=5, write_capacity_units=5, wait=True)
    print("UserTable created successfully!")
else:
    print("Table already exists.")
