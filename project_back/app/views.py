from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer,RecurringExpenseSerializer,GroupSerializer,GroupMemberSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import viewsets,permissions
from rest_framework.permissions import IsAdminUser
from .models import Expense, Category,Budget,RecurringExpense
from .serializers import ExpenseSerializer
from .serializers import CategorySerializer
from rest_framework.authentication import TokenAuthentication
from .serializers import BudgetSerializer,NotificationSerializer
from django.db.models import Sum, Q
from django.utils import timezone
from .models import Group,GroupMember,GroupExpense,PaymentStatus,Notification
from decimal import Decimal,ROUND_DOWN
from django.db import transaction
from django.core.mail import send_mail








class RegisterView(APIView):
    def post(self, request):
        print("📩 Received data:", request.data)
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            try:
                user = serializer.save()
                UserProfile.objects.create(user=user, user_type='regular')
                print("✅ User created successfully:", user.username)
                return Response(
                    {"message": "✅ Account created successfully!"},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                print("🔥 Error creating profile:", str(e))
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        print("❌ Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response({"error": "Provide username/email and password"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle username or email (case-insensitive)
        try:
            if '@' in username_or_email:
                user_obj = User.objects.get(email__iexact=username_or_email)
                username = user_obj.username
            else:
                user_obj = User.objects.get(username__iexact=username_or_email)
                username = user_obj.username
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        try:
            profile = UserProfile.objects.get(user=user)
            user_type = profile.user_type
        except UserProfile.DoesNotExist:
            user_type = "regular"

        user_data = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "user_type": user_type,
        }

        return Response({"token": token.key, "user": user_data}, status=status.HTTP_200_OK)



#====================================='ADMIN'================================================================================

#---------------------------------/usermanagement/---------------------------------------------------------------------------


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .models import UserProfile


class RegularUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Only admin can view this list

    def get_queryset(self):
        """
        Return only users who are not admins.
        """
        return User.objects.filter(userprofile__user_type='regular')
    

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            user = self.get_object()

            # Prevent deleting admin users
            if hasattr(user, 'userprofile') and user.userprofile.user_type == 'admin':
                return Response(
                    {"error": "Admin users cannot be deleted."},
                    status=status.HTTP_403_FORBIDDEN
                )

            username = user.username
            user.delete()
            return Response(
                {"message": f"✅ User '{username}' deleted successfully."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("🔥 Delete error:", str(e))
            return Response(
                {"error": f"Failed to delete user: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
#---------------------------------/category manangement/---------------------------------------------------------------------------



class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 🔴 Update or Delete (Admin Only)
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    authentication_classes = [TokenAuthentication]


#====================================='USER'================================================================================
#---------------------------------/expense/---------------------------------------------------------------------------



# 🟢 List and Create Expenses (User Only)
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        # Return only expenses of the logged-in user
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# 🟡 Retrieve, Update, Delete Specific Expense
class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        # Users can access only their own expenses
        return Expense.objects.filter(user=self.request.user)
    

#---------------------------------/budget/---------------------------------------------------------------------------



# 🟢 List and Create Budgets (User)
from django.db.models import Sum
from datetime import date

class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        budgets = Budget.objects.filter(user=user)

        today = date.today()

        for budget in budgets:
            expenses = Expense.objects.filter(user=user, category=budget.category)

            if budget.duration.lower() == "monthly":
                expenses = expenses.filter(date__year=today.year, date__month=today.month)
            elif budget.duration.lower() == "yearly":
                expenses = expenses.filter(date__year=today.year)

            total_spent = expenses.aggregate(total=Sum('amount'))['total'] or 0
            budget.alert_status = total_spent > budget.limit_amount
            budget.save(update_fields=['alert_status'])

        return budgets

# ✏️ Update / Delete Budgets
class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    


#---------------------------------/charts/---------------------------------------------------------------------------



class ExpenseSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        today = date.today()

        # 🥧 Category-wise total
        category_data = (
            Expense.objects.filter(user=user)
            .values('category__category_name')
            .annotate(total=Sum('amount'))
        )

        # 📊 Monthly total (per month in current year)
        monthly_data = (
            Expense.objects.filter(user=user, date__year=today.year)
            .values('date__month')
            .annotate(total=Sum('amount'))
            .order_by('date__month')
        )

        # 💰 Overall summary
        total_expense = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        this_month_total = Expense.objects.filter(
            user=user, date__year=today.year, date__month=today.month
        ).aggregate(total=Sum('amount'))['total'] or 0

        top_category = (
            max(category_data, key=lambda x: x["total"])["category__category_name"]
            if category_data else "N/A"
        )

        return Response({
            "category_data": category_data,
            "monthly_data": monthly_data,
            "total_expense": total_expense,
            "this_month_total": this_month_total,
            "top_category": top_category,
        })
    


#---------------------------------/recurring bills/---------------------------------------------------------------------------


# 🟢 List and Create Recurring Expenses
class RecurringExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        recurring = serializer.save(user=self.request.user)

        # 🧾 Automatically add this as an expense record on creation
        Expense.objects.create(
            user=self.request.user,
            category=recurring.category,
            amount=recurring.amount,
            date=recurring.start_date,
            description=f"Recurring ({recurring.recurrence})",
            recurring=True
        )


# ✏️ Retrieve, Update, Delete Recurring Expense
class RecurringExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        """Allow delete only if it belongs to user"""
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"error": "You are not authorized to delete this expense."},
                            status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response({"message": "✅ Recurring expense deleted successfully."},
                        status=status.HTTP_200_OK)
    


#--------------------------------/export/---------------------------------------------------------------------------

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.http import HttpResponse
from io import BytesIO
import pandas as pd
from reportlab.pdfgen import canvas
from .models import Expense

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def export_expenses(request):
    user = request.user
    expenses = Expense.objects.filter(user=user)
    if not expenses.exists():
        return Response({"error": "No expenses found"}, status=404)
    
    export_format = request.GET.get('format', 'excel')
    
    if export_format == 'pdf':
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        y = 750
        p.drawString(100, y, f"Expense Report - {user.username}")
        y -= 30
        for exp in expenses:
            p.drawString(100, y, f"{exp.date} | {exp.amount} | {exp.description or '-'}")
            y -= 20
            if y < 50:
                p.showPage()
                y = 750
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="MyExpense_Report.pdf"'
        return response
    
    # Default Excel export
    data = [
        {"Date": exp.date.strftime("%Y-%m-%d"), "Amount": exp.amount, "Description": exp.description or ""}
        for exp in expenses
    ]
    df = pd.DataFrame(data)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    buffer.seek(0)
    response = HttpResponse(
        buffer,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="MyExpense_Report.xlsx"'
    return response



#--------------------------------/filter/---------------------------------------------------------------------------


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def filter_expenses(request):
    user = request.user
    category = request.GET.get('category')
    min_amount = request.GET.get('min_amount')
    max_amount = request.GET.get('max_amount')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    filters = Q(user=user)

    if category:
        filters &= Q(category__id=category)
    if min_amount:
        filters &= Q(amount__gte=min_amount)
    if max_amount:
        filters &= Q(amount__lte=max_amount)
    if start_date and end_date:
        filters &= Q(date__range=[start_date, end_date])
    elif start_date:
        filters &= Q(date__gte=start_date)
    elif end_date:
        filters &= Q(date__lte=end_date)

    expenses = Expense.objects.filter(filters).select_related('category').order_by('-date')
    total = expenses.aggregate(total=Sum('amount'))['total'] or 0

    data = ExpenseSerializer(expenses, many=True).data

    return Response({
        "filtered_expenses": data,
        "total_expense": total,
        "count": len(expenses)
    })




# app/views.py (only the related parts are shown — integrate into your existing views file)




# helper to create "Shared" category per user to attach per-user Expense
def get_or_create_shared_category_for_user(user):
    shared_cat, _ = Category.objects.get_or_create(user=user, category_name="Shared")
    return shared_cat

# Groups: list/create
class GroupListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        groups = Group.objects.filter(Q(created_by=user) | Q(groupmember__user=user)).distinct()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get("group_name")
        if not name:
            return Response({"error": "Group name required"}, status=status.HTTP_400_BAD_REQUEST)
        group = Group.objects.create(group_name=name, created_by=request.user)
        GroupMember.objects.create(group=group, user=request.user)
        return Response({"message": "Group created"}, status=status.HTTP_201_CREATED)


# Add member endpoint: accept user_id or username
class AddGroupMemberView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, group_id):
        # Accept either user_id (int) or username (string)
        user_id = request.data.get("user_id")
        username = request.data.get("username")

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        # Authorization: optionally restrict adding to group members/creator only
        # For now allow group creator or any existing member to add:
        if not GroupMember.objects.filter(group=group, user=request.user).exists() and group.created_by != request.user:
            return Response({"error": "Not authorized to add members"}, status=status.HTTP_403_FORBIDDEN)

        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User id not found"}, status=status.HTTP_404_NOT_FOUND)
        elif username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "Username not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Provide user_id or username"}, status=status.HTTP_400_BAD_REQUEST)

        if GroupMember.objects.filter(group=group, user=user).exists():
            return Response({"message": "User already in group"}, status=status.HTTP_400_BAD_REQUEST)

        GroupMember.objects.create(group=group, user=user)

        # return updated group data so frontend can immediately show the new member
        serializer = GroupSerializer(group)
        return Response({"message": f"{user.username} added", "group": serializer.data}, status=status.HTTP_201_CREATED)


# Remove member (by user_id or username)
class RemoveGroupMemberView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, group_id):
        user_id = request.data.get("user_id")
        username = request.data.get("username")

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only members or creator can remove — here we require creator or the member themselves
        if not (group.created_by == request.user or GroupMember.objects.filter(group=group, user=request.user).exists()):
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        elif username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Provide user_id or username"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = GroupMember.objects.get(group=group, user=user)
            member.delete()
            serializer = GroupSerializer(group)
            return Response({"message": f"{user.username} removed", "group": serializer.data}, status=status.HTTP_200_OK)
        except GroupMember.DoesNotExist:
            return Response({"error": "Member not in group"}, status=status.HTTP_404_NOT_FOUND)


# Delete group
class DeleteGroupView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def delete(self, request, pk):
        try:
            group = Group.objects.get(id=pk, created_by=request.user)
            group.delete()
            return Response({"message": "Group deleted"}, status=status.HTTP_200_OK)
        except Group.DoesNotExist:
            return Response({"error": "Group not found or not authorized"}, status=status.HTTP_404_NOT_FOUND)


# Add group expense and auto-split (supports equal / percentage / custom)
class AddGroupExpenseView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        amount = request.data.get("amount")
        date = request.data.get("date")
        description = request.data.get("description", "")
        split_type = request.data.get("split_type", "equal")  # equal | percentage | custom
        splits = request.data.get("splits", None)  # list of { user_id, percent } or { user_id, amount }

        if not amount or not date:
            return Response({"error": "Amount & Date required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount))
        except:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        members = list(GroupMember.objects.filter(group=group).select_related("user"))
        if len(members) == 0:
            return Response({"error": "No members in group"}, status=status.HTTP_400_BAD_REQUEST)

        # Build per-member shares
        per_member_shares = {}
        if split_type == "equal" or not splits:
            per_head = (amount / Decimal(len(members))).quantize(Decimal("0.01"))
            # Distribute remainder to first member to keep sum exact
            total_assigned = per_head * Decimal(len(members))
            remainder = (amount - total_assigned).quantize(Decimal("0.01"))
            for idx, m in enumerate(members):
                per_member_shares[m.user.id] = per_head + (remainder if idx == 0 else Decimal("0.00"))
        elif split_type == "percentage":
            # splits expected: [{user_id, percent}, ...]
            total_pct = sum([float(x.get("percent", 0) or 0) for x in splits])
            if abs(total_pct - 100.0) > 0.1:
                return Response({"error": "Percentages must sum to 100"}, status=status.HTTP_400_BAD_REQUEST)
            for s in splits:
                uid = int(s["user_id"])
                pct = Decimal(str(s.get("percent", 0)))
                per_member_shares[uid] = (amount * (pct / Decimal("100.0"))).quantize(Decimal("0.01"))
        else:
            # custom amounts: splits expected: [{user_id, amount}, ...]
            total_custom = sum([Decimal(str(x.get("amount", 0) or 0)) for x in splits])
            if abs(total_custom - amount) > Decimal("0.1"):
                return Response({"error": "Custom amounts must sum to total amount"}, status=status.HTTP_400_BAD_REQUEST)
            for s in splits:
                uid = int(s["user_id"])
                per_member_shares[uid] = Decimal(str(s.get("amount", 0))).quantize(Decimal("0.01"))

        # create group expense
        gexp = GroupExpense.objects.create(group=group, added_by=request.user, amount=amount, description=description, date=date)

        # create PaymentStatus and personal Expense rows
        for m in members:
            share_amount = per_member_shares.get(m.user.id, Decimal("0.00"))
            status_val = "Paid" if m.user == request.user else "Pending"
            PaymentStatus.objects.create(gexpense=gexp, user=m.user, status=status_val, amount_share=share_amount)

            # ensure shared category exists
            shared_cat = get_or_create_shared_category_for_user(m.user)

            # create expense record for their share
            Expense.objects.create(
                user=m.user,
                category=shared_cat,
                amount=share_amount,
                date=date,
                description=f"{description} - Shared ({group.group_name})",
                recurring=False
            )

        serializer = GroupSerializer(group)
        return Response({"message": "Expense added & split", "group": serializer.data}, status=status.HTTP_201_CREATED)


# Member toggles own status
class UpdatePaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, expense_id):
        new_status = request.data.get("status")
        if new_status not in ["Paid", "Pending"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ps = PaymentStatus.objects.get(gexpense_id=expense_id, user=request.user)
            ps.status = new_status
            ps.save(update_fields=['status'])
            return Response({"message": "Status updated"}, status=status.HTTP_200_OK)
        except PaymentStatus.DoesNotExist:
            return Response({"error": "Payment record not found"}, status=status.HTTP_404_NOT_FOUND)


# Creator marks any member's status
class UpdatePaymentStatusByCreatorView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, expense_id):
        user_id = request.data.get("user_id")
        new_status = request.data.get("status")

        if new_status not in ["Paid", "Pending"]:
            return Response({"error": "Invalid status"}, status=400)

        try:
            gexp = GroupExpense.objects.select_related("group", "added_by").get(id=expense_id)
        except GroupExpense.DoesNotExist:
            return Response({"error": "Expense not found"}, status=404)

        # ❗ NEW RULE: Only the person who added the split can mark others
        if gexp.added_by != request.user:
            return Response({"error": "Only the creator of this expense can update others' status"}, status=403)

        try:
            ps = PaymentStatus.objects.get(gexpense=gexp, user_id=user_id)
            ps.status = new_status
            ps.save(update_fields=['status'])
            return Response({"message": "Status updated by creator"}, status=200)
        except PaymentStatus.DoesNotExist:
            return Response({"error": "Payment status not found"}, status=404)



# Delete group expense (allowed to creator or the user who added the expense)
class DeleteGroupExpenseView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def delete(self, request, expense_id):
        try:
            gexp = GroupExpense.objects.get(id=expense_id)
        except GroupExpense.DoesNotExist:
            return Response({"error": "Expense not found"}, status=404)

        # ❗ NEW RULE: Only the person who added the expense can delete it
        if gexp.added_by != request.user:
            return Response({"error": "Only the creator of this expense can delete it"}, status=403)

        PaymentStatus.objects.filter(gexpense=gexp).delete()
        Expense.objects.filter(group_expense=gexp).delete()
        gexp.delete()

        return Response({"message": "Group expense deleted"}, status=200)


from django.db import models


class GroupSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)

        # Get all expenses of group
        expenses = GroupExpense.objects.filter(group=group)

        members = GroupMember.objects.filter(group=group).select_related("user")

        # Per-member totals
        per_member_totals = []
        summary = []

        for m in members:
            user = m.user

            total_paid = PaymentStatus.objects.filter(
                gexpense__group=group,
                user=user,
                status="Paid"
            ).aggregate(models.Sum('amount_share'))['amount_share__sum'] or 0

            total_owed = PaymentStatus.objects.filter(
                gexpense__group=group,
                user=user
            ).aggregate(models.Sum('amount_share'))['amount_share__sum'] or 0

            pending = PaymentStatus.objects.filter(
                gexpense__group=group,
                user=user,
                status="Pending"
            ).aggregate(models.Sum('amount_share'))['amount_share__sum'] or 0

            per_member_totals.append({
                "user_id": user.id,
                "username": user.username,
                "total": float(total_owed),
            })

            summary.append({
                "user_id": user.id,
                "username": user.username,
                "paid": float(total_paid),
                "owed": float(total_owed),
                "pending": float(pending),
            })

        # Monthly group totals (for bar chart)
        monthly_data = {}
        for exp in expenses:
            m = exp.date.strftime("%Y-%m")
            monthly_data[m] = monthly_data.get(m, 0) + float(exp.amount)

        monthly_data_list = [{"month": k, "total": v} for k, v in monthly_data.items()]

        return Response({
            "per_member_totals": per_member_totals,
            "summary": summary,
            "monthly_data": monthly_data_list,
        })





# ---------------- NOTIFICATIONS ----------------
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        # return only the user's notifications
        qs = Notification.objects.filter(user=request.user).order_by('-timestamp')
        serializer = NotificationSerializer(qs, many=True)
        return Response(serializer.data)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, notif_id):
        try:
            notif = Notification.objects.get(id=notif_id, user=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

        notif.status = "read"
        notif.save(update_fields=["status"])
        return Response({"message": "marked as read"}, status=200)






@api_view(['GET'])
@permission_classes([IsAdminUser])  # Only admin can access
@authentication_classes([TokenAuthentication])
def admin_report(request):
    user_id = request.GET.get('user')
    start_date = request.GET.get('startDate')
    end_date = request.GET.get('endDate')

    filters = Q()

    if user_id:
        filters &= Q(user__id=user_id)
    if start_date and end_date:
        filters &= Q(date__range=[start_date, end_date])
    elif start_date:
        filters &= Q(date__gte=start_date)
    elif end_date:
        filters &= Q(date__lte=end_date)

    expenses = Expense.objects.filter(filters).select_related('category', 'user').order_by('-date')

    # Serialize
    data = []
    for exp in expenses:
        data.append({
            "id": exp.id,
            "username": exp.user.username,
            "category_name": exp.category.category_name if exp.category else "Uncategorized",
            "amount": exp.amount,
            "date": exp.date,
            "description": exp.description,
        })

    return Response(data)
