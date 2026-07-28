from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("pos", "0042_order_order_number_nullable"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(name="Warehouse", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("code", models.CharField(max_length=30, unique=True)), ("name", models.CharField(max_length=150)),
            ("address", models.TextField(blank=True)), ("is_active", models.BooleanField(default=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("store", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="warehouses", to="pos.store")),
        ], options={"ordering": ["name"]}),
        migrations.CreateModel(name="WarehouseTransfer", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("transfer_number", models.CharField(max_length=30, unique=True)),
            ("status", models.CharField(choices=[("draft", "Draft"), ("in_transit", "In transit"), ("received", "Received"), ("cancelled", "Cancelled")], default="draft", max_length=20)),
            ("note", models.TextField(blank=True)), ("created_at", models.DateTimeField(auto_now_add=True)), ("received_at", models.DateTimeField(blank=True, null=True)),
            ("destination_warehouse", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="incoming_transfers", to="pos.warehouse")),
            ("received_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="received_stock_transfers", to=settings.AUTH_USER_MODEL)),
            ("requested_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="requested_stock_transfers", to=settings.AUTH_USER_MODEL)),
            ("source_warehouse", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="outgoing_transfers", to="pos.warehouse")),
        ], options={"ordering": ["-created_at"]}),
        migrations.CreateModel(name="WarehouseStock", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("quantity", models.DecimalField(decimal_places=2, default=0, max_digits=14)), ("reorder_point", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
            ("bin_location", models.CharField(blank=True, max_length=60)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="warehouse_stock", to="pos.product")),
            ("warehouse", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="stock_levels", to="pos.warehouse")),
        ]),
        migrations.CreateModel(name="WarehouseTransferItem", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("quantity", models.DecimalField(decimal_places=2, max_digits=14)), ("received_quantity", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
            ("product", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to="pos.product")),
            ("transfer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="pos.warehousetransfer")),
        ]),
        migrations.AddConstraint(model_name="warehousestock", constraint=models.UniqueConstraint(fields=("warehouse", "product"), name="unique_warehouse_product_stock")),
        migrations.AddConstraint(model_name="warehousetransferitem", constraint=models.UniqueConstraint(fields=("transfer", "product"), name="unique_transfer_product")),
    ]
