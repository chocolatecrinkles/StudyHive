from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from core.forms import CustomUserCreationForm, CustomAuthenticationForm

def login_view(request):

    if request.user.is_authenticated:
        return redirect("core:home")

    if request.method == "POST":
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get("next") or "core:home"
            return redirect(next_url)
        else:
            messages.error(request, "Invalid credentials.")
    else:
        form = CustomAuthenticationForm()
    return render(request, "login.html", {"form": form})



@login_required(login_url="core:login")
def home(request):
    return render(request, "home.html")


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("core:login")  # ✅ Namespace added


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Account created successfully!")
            return redirect("core:home")  # ✅ Namespace added
        else:
            messages.error(request, "Please fix the errors below.")
    else:
        form = CustomUserCreationForm()
    return render(request, "register.html", {"form": form})

@login_required(login_url='core:login')
def profile_view(request):
    return render(request, 'profile.html')

