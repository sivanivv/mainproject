from django.contrib import admin
from .models import *

admin.site.register(UserProfile)
admin.site.register(Category)
admin.site.register(Expense)
admin.site.register(Budget)
admin.site.register(Group)
admin.site.register(GroupMember)
admin.site.register(GroupExpense)
admin.site.register(PaymentStatus)
admin.site.register(Notification)
admin.site.register(AuditLog)
