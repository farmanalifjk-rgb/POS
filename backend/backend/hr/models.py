"""
HR / Employee Management models.

Covers departments, employees, shifts, attendance, leave requests,
and full payroll with salary breakdown (basic, allowances, deductions).
"""
from django.conf import settings
from django.db import models


class Department(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Employee(models.Model):
    GENDER_CHOICES = [("male","Male"),("female","Female"),("other","Other")]
    STATUS_ACTIVE  = "active"
    STATUS_CHOICES = [("active","Active"),("on_leave","On Leave"),("terminated","Terminated")]

    user          = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="employee_profile")
    department    = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name="employees")
    employee_id   = models.CharField(max_length=30, unique=True)
    first_name    = models.CharField(max_length=100)
    last_name     = models.CharField(max_length=100)
    gender        = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone         = models.CharField(max_length=20, blank=True)
    email         = models.EmailField(blank=True)
    address       = models.TextField(blank=True)
    role          = models.CharField(max_length=100, blank=True)
    hire_date     = models.DateField()
    basic_salary  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    photo         = models.ImageField(upload_to="employees/", null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Shift(models.Model):
    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="shifts")
    date       = models.DateField()
    start_time = models.TimeField()
    end_time   = models.TimeField()
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        constraints = [models.UniqueConstraint(fields=["employee","date"], name="unique_employee_shift_per_day")]


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent",  "Absent"),
        ("late",    "Late"),
        ("half_day","Half Day"),
        ("holiday", "Holiday"),
    ]

    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance")
    date       = models.DateField()
    clock_in   = models.DateTimeField(null=True, blank=True)
    clock_out  = models.DateTimeField(null=True, blank=True)
    status     = models.CharField(max_length=15, choices=STATUS_CHOICES, default="absent")
    notes      = models.TextField(blank=True)

    class Meta:
        ordering = ["-date"]
        constraints = [models.UniqueConstraint(fields=["employee","date"], name="unique_employee_attendance_per_day")]

    @property
    def hours_worked(self):
        if self.clock_in and self.clock_out:
            delta = self.clock_out - self.clock_in
            return round(delta.total_seconds() / 3600, 2)
        return 0


class LeaveType(models.Model):
    name             = models.CharField(max_length=80, unique=True)
    days_allowed     = models.PositiveIntegerField(default=0, help_text="Days allowed per year")
    is_paid          = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ("pending",  "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled","Cancelled"),
    ]

    employee     = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    leave_type   = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date   = models.DateField()
    end_date     = models.DateField()
    reason       = models.TextField(blank=True)
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")
    reviewed_by  = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    reviewed_at  = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def total_days(self):
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0


class PayrollRun(models.Model):
    STATUS_DRAFT   = "draft"
    STATUS_POSTED  = "posted"
    STATUS_CHOICES = [(STATUS_DRAFT,"Draft"),(STATUS_POSTED,"Posted")]

    month      = models.PositiveSmallIntegerField()   # 1-12
    year       = models.PositiveSmallIntegerField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    notes      = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-year", "-month"]
        constraints = [models.UniqueConstraint(fields=["month","year"], name="unique_payroll_month_year")]

    def __str__(self):
        return f"Payroll {self.year}-{self.month:02d}"


class PayrollEntry(models.Model):
    payroll_run  = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="entries")
    employee     = models.ForeignKey(Employee, on_delete=models.PROTECT)
    basic        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net          = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["payroll_run","employee"], name="unique_payroll_entry")]

    def save(self, *args, **kwargs):
        self.net = self.basic + self.allowances - self.deductions - self.tax
        super().save(*args, **kwargs)


