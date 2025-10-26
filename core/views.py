from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, logout
from core.forms import CustomUserCreationForm, CustomAuthenticationForm
from .models import UserProfile  
from django.http import JsonResponse
from core.models import StudySpot
from django.core.exceptions import PermissionDenied

def staff_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied  # Returns a 403 Forbidden page
        return view_func(request, *args, **kwargs)
    return login_required(wrapper)

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
    study_spaces = StudySpot.objects.all().order_by('-id')
    return render(request, "listings.html", {"study_spaces": study_spaces})


@staff_required
def create_listing(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        location = request.POST.get('location')
        description = request.POST.get('description')
        wifi = request.POST.get('wifi') == 'on'
        ac = request.POST.get('ac') == 'on'
        free = request.POST.get('free') == 'on'
        coffee = request.POST.get('coffee') == 'on'
        rating = request.POST.get('rating')
        image = request.FILES.get('image')

        # ✅ Save the record to Supabase DB
        StudySpot.objects.create(
            owner=request.user,
            name=name,
            location=location,
            description=description,
            wifi=wifi,
            ac=ac,
            free=free,
            coffee=coffee,
            rating=0,
            image=image
        )

        messages.success(request, "✅ Listing successfully created!")
        return redirect('core:listings')

    return render(request, 'create_listing.html')

@staff_required
def my_listings_view(request):
    my_listings = StudySpot.objects.all().order_by('-id')
    return render(request, 'my_listings.html', {'my_listings': my_listings})



@staff_required
def edit_listing(request, id):
    spot = get_object_or_404(StudySpot, id=id)

    if request.method == "POST":
        spot.name = request.POST["name"]
        spot.location = request.POST["location"]
        spot.description = request.POST["description"]
        if "image" in request.FILES:
            spot.image = request.FILES["image"]
        spot.save()
        return redirect("core:my_listings")

    return render(request, "edit_listing.html", {"spot": spot})


def delete_listing(request, id):
    spot = get_object_or_404(StudySpot, id=id)
    spot.delete()
    return redirect("core:my_listings")



