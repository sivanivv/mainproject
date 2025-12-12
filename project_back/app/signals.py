# app/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GroupMember, GroupExpense, PaymentStatus, Notification


# When a user is added to a group
@receiver(post_save, sender=GroupMember)
def notify_group_add(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            message=f"You were added to group '{instance.group.group_name}'"
        )


# When a new shared expense is added
@receiver(post_save, sender=GroupExpense)
def notify_expense_add(sender, instance, created, **kwargs):
    if created:
        members = instance.group.groupmember_set.all()
        for m in members:
            if m.user != instance.added_by:
                Notification.objects.create(
                    user=m.user,
                    message=f"New expense added in group '{instance.group.group_name}': {instance.description}"
                )


# When creator marks someone paid/pending
@receiver(post_save, sender=PaymentStatus)
def notify_status_update(sender, instance, created, **kwargs):
    if not created:
        Notification.objects.create(
            user=instance.user,
            message=f"Your payment status marked as '{instance.status}'"
        )
