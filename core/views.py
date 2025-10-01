from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def _style_auth_form(form: AuthenticationForm):
    input_cls = "w-full rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
    form.fields["username"].widget.attrs.update({
        "class": input_cls, "placeholder": "Enter your email / username"
    })
    form.fields["password"].widget.attrs.update({
        "class": input_cls, "placeholder": "Enter your password"
    })

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        _style_auth_form(form)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, "Logged in.")
            return redirect(request.GET.get("next") or "home")
        messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm(request)
        _style_auth_form(form)
    return render(request, "login.html", {"form": form})

def logout_view(request):
    logout(request)
    messages.info(request, "Logged out.")
    return redirect("login")

@login_required
def home(request):
    return render(request, "home.html", {"username": request.user.username})
