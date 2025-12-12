from django.db import models
from django.contrib.auth.models import User
from datetime import date, timedelta


# ---------------- USER (from auth model) ----------------
# We use Django's built-in User model (username, email, password)
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=50, default='regular')

    def __str__(self):
        return self.user.username

# ---------------- CATEGORY ----------------
class Category(models.Model):
    category_name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.category_name


# ---------------- EXPENSE ----------------
class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=255, null=True, blank=True)
    recurring = models.BooleanField(default=False)

    # NEW: link back to a group expense (optional)
    group_expense = models.ForeignKey('GroupExpense', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.user.username} - ₹{self.amount}"

# ---------------- BUDGET ----------------
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=20)
    alert_status = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.category.category_name} - {self.limit_amount}"


# ---------------- GROUP ----------------
class Group(models.Model):
    group_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.group_name


# ---------------- GROUP MEMBER ----------------
class GroupMember(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} in {self.group.group_name}"


# ---------------- GROUP EXPENSE ----------------
class GroupExpense(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.group.group_name} - {self.amount}"


# ---------------- PAYMENT STATUS ----------------
class PaymentStatus(models.Model):
    gexpense = models.ForeignKey(GroupExpense, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, default="Pending")  # Paid/Pending
    amount_share = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    marked_by_creator = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username}: {self.status}"


# ---------------- NOTIFICATION ----------------
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='unread')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.message}"


# ---------------- AUDIT LOG ----------------
class AuditLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.admin.username} - {self.action}"


# ---------------- RECURRING EXPENSE ----------------


class RecurringExpense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    recurrence = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ])
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.category.category_name} ({self.recurrence})"