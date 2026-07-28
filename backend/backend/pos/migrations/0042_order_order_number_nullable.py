# Generated manually for the production-safe order number creation flow.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pos", "0041_userprofile_password_changed_at_authtoken_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="order_number",
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
    ]
