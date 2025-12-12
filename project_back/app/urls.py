from django.urls import path
from .views import RegisterView, LoginView, RegularUserListView, DeleteUserView, CategoryDetailView
from .views import CategoryListCreateView,ExpenseDetailView,ExpenseListCreateView,BudgetListCreateView
from .views import BudgetDetailView,ExpenseSummaryView,RecurringExpenseListCreateView,RecurringExpenseDetailView
from .views import export_expenses, filter_expenses,GroupListCreateView,AddGroupMemberView,RemoveGroupMemberView
from .views import DeleteGroupView,AddGroupExpenseView,UpdatePaymentStatusView,UpdatePaymentStatusByCreatorView
from .views import DeleteGroupExpenseView,GroupSummaryView,NotificationMarkReadView
from .views import NotificationListView

urlpatterns = [
    # Auth & Admin
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', RegularUserListView.as_view(), name='regular-users'),
    path('users/<int:pk>/', DeleteUserView.as_view(), name='delete-user'),

    # Admin: Category Management
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # User: Expense Management
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),

   


    # User: Budget ✅
    path('budgets/', BudgetListCreateView.as_view(), name='budget-list'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),


    path('expense-summary/', ExpenseSummaryView.as_view(), name='expense-summary'),


    path('recurring/', RecurringExpenseListCreateView.as_view(), name='recurring-list'),
    path('recurring/<int:pk>/', RecurringExpenseDetailView.as_view(), name='recurring-detail'),


    path("export-expenses/", export_expenses, name="export-expenses"),

    path('expenses/filter/', filter_expenses, name='filter-expenses'),


    path('groups/', GroupListCreateView.as_view(), name='group-list'),
    path('groups/<int:group_id>/add-member/', AddGroupMemberView.as_view(), name='add-group-member'),
    path('groups/<int:group_id>/remove-member/', RemoveGroupMemberView.as_view(), name='remove-group-member'),
    path('groups/<int:pk>/delete/', DeleteGroupView.as_view(), name='delete-group'),
    path('groups/<int:group_id>/summary/', GroupSummaryView.as_view(), name='group-summary'),
    path('groups/<int:group_id>/expense/add/', AddGroupExpenseView.as_view(), name='add-group-expense'),
    path('groups/expense/<int:expense_id>/update-status/', UpdatePaymentStatusView.as_view(), name='update-payment-status'),
    path('groups/expense/<int:expense_id>/update-status-by-creator/', UpdatePaymentStatusByCreatorView.as_view(), name='update-payment-status-by-creator'),
    path('groups/expense/<int:expense_id>/delete/', DeleteGroupExpenseView.as_view(), name='delete-group-expense'),



   path("notifications/", NotificationListView.as_view(), name="notifications"),
path("notifications/<int:notif_id>/read/", NotificationMarkReadView.as_view(), name="notification-read"),

]
