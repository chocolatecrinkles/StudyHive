from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()                 # already authenticated
            login(request, user)                   # starts session
            messages.success(request, "Logged in.")
            return redirect(request.GET.get("next") or "home")
        messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm(request)
    return render(request, "login.html", {"form": form})

def logout_view(request):
    logout(request)
    messages.info(request, "Logged out.")
    return redirect("login")

def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # auto-login after registration (optional)
            login(request, user)
            messages.success(request, "Account created. Welcome!")
            return redirect("home")
        messages.error(request, "Please fix the errors below.")
    else:
        form = UserCreationForm()
    return render(request, "register.html", {"form": form})

@login_required
def home(request):
    return render(request, "home.html", {"username": request.user.username})
