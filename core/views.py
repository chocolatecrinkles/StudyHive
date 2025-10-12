from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, logout
from core.forms import CustomUserCreationForm, CustomAuthenticationForm
from .models import UserProfile  
from django.http import JsonResponse
from core.models import StudySpot



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
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, "profile.html", {"profile": profile})


@login_required(login_url='core:login')
def manage_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        # Get form data
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        middle_initial = request.POST.get("middle_initial", "").strip()
        phone_number = request.POST.get("phone_number", "").strip()
        bio = request.POST.get("bio", "").strip()
        
        # Get file and removal flag
        avatar = request.FILES.get("avatar")
        avatar_removed = request.POST.get("avatar_removed")

        # Validate required fields
        if not first_name or not last_name or not username or not email:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"status": "error", "message": "First name, last name, username, and email are required."}, status=400)
            messages.error(request, "First name, last name, username, and email are required.")
            return redirect("core:manage_profile")

        # Update user fields
        user = request.user
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.email = email
        user.save()

        # Update profile fields
        profile.middle_initial = middle_initial
        profile.phone_number = phone_number
        profile.bio = bio

        # Handle avatar removal
        if avatar_removed == 'true':
            # Delete existing avatar if it exists
            if profile.avatar_url:
                profile.avatar_url.delete(save=False)
                profile.avatar_url = None
        # Handle new avatar upload (only if not removing)
        elif avatar:
            # Delete old avatar if uploading new one
            if profile.avatar_url:
                profile.avatar_url.delete(save=False)
            profile.avatar_url = avatar

        # Update full name
        profile.full_name = f"{first_name} {middle_initial} {last_name}".strip()
        profile.save()

        # Return JSON response if AJAX request
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({"status": "ok", "message": "Profile updated successfully."})
        
        # Regular form submission
        messages.success(request, "Profile updated successfully.")
        return redirect("core:profile")

    context = {
        "profile": profile,
        "user": request.user,
    }
    return render(request, "manage_profile.html", context)


def listings_view(request):
    study_spaces = StudySpot.objects.all()
    return render(request, "listings.html", {"study_spaces": study_spaces})



