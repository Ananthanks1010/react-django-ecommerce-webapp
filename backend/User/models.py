from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute
from django.conf import settings

class User(Model):
    """
    User model for DynamoDB using PynamoDB
    """
    class Meta:
        table_name = "users"  # DynamoDB table name
        region = settings.AWS_REGION_NAME # AWS Region
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY

    user_id = UnicodeAttribute(hash_key=True)  # Primary Key
    user_name = UnicodeAttribute()
    user_email = UnicodeAttribute()
    user_password = UnicodeAttribute()

    def __str__(self):
        return f"User({self.user_id}, {self.user_name}, {self.user_email})"

# ✅ Function to Create Table if Not Exists
def create_user_table():
    if User.exists():
        print("✅ User table already exists")
    else:
        User.create_table(read_capacity_units=1, write_capacity_units=1, wait=True)
        print("🎉 User table created successfully")

# Call the function to ensure table creation
create_user_table()
