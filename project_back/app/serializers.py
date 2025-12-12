from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category,Expense,Budget,RecurringExpense,Group,GroupMember,GroupExpense,Notification



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password']

    def create(self, validated_data):
        # ensure password hashing
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

# add category/serializers.py

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'category', 'category_name', 'amount', 'date', 'description', 'recurring']


#buget

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'limit_amount', 'duration', 'alert_status']
    

#recurringexpense

class RecurringExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)

    class Meta:
        model = RecurringExpense
        fields = ['id', 'category', 'category_name', 'amount', 'start_date', 'recurrence', 'active']

#--------------------------------/group/---------------------------------------------------------------------

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, GroupMember, GroupExpense, PaymentStatus

class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'group', 'user']

class PaymentStatusSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PaymentStatus
        fields = ['id', 'user', 'status', 'amount_share']

class GroupExpenseSerializer(serializers.ModelSerializer):
    added_by = UserSerializer(read_only=True)
    statuses = serializers.SerializerMethodField()
    amount = serializers.FloatField()

    class Meta:
        model = GroupExpense
        fields = ['id', 'group', 'added_by', 'description', 'amount', 'date', 'statuses']

    def get_statuses(self, obj):
        records = PaymentStatus.objects.filter(gexpense=obj).select_related('user')
        return PaymentStatusSerializer(records, many=True).data

class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    # members: usernames only (legacy)
    members = serializers.SerializerMethodField()
    # members_full: list of dicts with id + username for frontend
    members_full = serializers.SerializerMethodField()
    expenses = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'group_name', 'created_by', 'members', 'members_full', 'expenses']

    def get_members(self, obj):
        members = GroupMember.objects.filter(group=obj).select_related('user')
        # Return plain username list to make rendering easy in React older code
        return [m.user.username for m in members]

    def get_members_full(self, obj):
        members = GroupMember.objects.filter(group=obj).select_related("user")
        data = []
        for m in members:
            if m.user:  # avoid unexpected None
                data.append({
                    "id": m.user.id,
                    "username": m.user.username,
                    "email": m.user.email or ""
                })
        return data

    def get_expenses(self, obj):
        expenses = GroupExpense.objects.filter(group=obj).order_by('-date')
        return GroupExpenseSerializer(expenses, many=True).data
    

#--------------------------------/notifications/---------------------------------------------------------------------


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'status', 'timestamp']
