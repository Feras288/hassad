/**
 * AuthPage — صفحة التسجيل والدخول لمنصة حصاد
 * Design: Split-screen layout — خلفية زراعية على اليمين، نموذج على اليسار
 * Colors: #2E7D32 (dark green), #4CAF50 (medium green), #C9A227 (golden wheat), #F5F1E8 (soft beige)
 * Modes: login | account-type | register-farmer | register-provider | register-supplier
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import AuthSidebar, { AuthMode } from "../components/auth/AuthSidebar";
import LoginForm from "../components/auth/LoginForm";
import AccountTypeSelect from "../components/auth/AccountTypeSelect";
import FarmerRegisterForm from "../components/auth/FarmerRegisterForm";
import ProviderRegisterForm from "../components/auth/ProviderRegisterForm";
import SupplierRegisterForm from "../components/auth/SupplierRegisterForm";

import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [farmerForm, setFarmerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    farmType: "",
    region: "",
    farmSize: "",
    crops: "",
  });
  const [providerForm, setProviderForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    experience: "",
    region: "",
    bio: "",
    certifications: "",
  });
  const [supplierForm, setSupplierForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    crNumber: "",
    vatNumber: "",
    region: "",
    city: "",
    category: "",
    productTypes: "",
    website: "",
    description: "",
  });

  const resetToLogin = () => {
    setMode("login");
    setStep(1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (error) {
        toast.error(error.message || "فشل تسجيل الدخول، يرجى التحقق من صحة البيانات");
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في حصاد");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    if (!farmerForm.email || !farmerForm.password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    if (farmerForm.password !== farmerForm.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!agreedToTerms) {
      toast.error("يرجى الموافقة على الشروط أولاً");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: farmerForm.email.trim().toLowerCase(),
        password: farmerForm.password,
        name: farmerForm.fullName || "مزارع حصاد",
      });

      if (error) {
        toast.error(error.message || "فشل إنشاء الحساب");
        return;
      }

      toast.success("تم إنشاء حسابك بنجاح! مرحباً بك في حصاد");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }
    if (!providerForm.email || !providerForm.password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    if (providerForm.password !== providerForm.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!agreedToTerms) {
      toast.error("يرجى الموافقة على الشروط أولاً");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: providerForm.email.trim().toLowerCase(),
        password: providerForm.password,
        name: providerForm.fullName || "مقدم خدمة",
      });

      if (error) {
        toast.error(error.message || "فشل إنشاء الحساب");
        return;
      }

      toast.success("تم إنشاء حسابك كمقدم خدمة بنجاح! مرحباً بك في حصاد");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!supplierForm.email || !supplierForm.password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    if (supplierForm.password !== supplierForm.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!agreedToTerms) {
      toast.error("يرجى الموافقة على الشروط أولاً");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: supplierForm.email.trim().toLowerCase(),
        password: supplierForm.password,
        name: supplierForm.companyName || supplierForm.contactName || "مورد معتمد",
      });

      if (error) {
        toast.error(error.message || "فشل إنشاء الحساب");
        return;
      }

      toast.success("تم تسجيل بيانات المنشأة بنجاح!");
      navigate("/supplier-pending");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      toast.error(err?.message || "فشل تسجيل الدخول الاجتماعي");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* ===== الجانب الأيمن: الخلفية الترويجية والمعلومات ===== */}
      <AuthSidebar mode={mode} />

      {/* ===== الجانب الأيسر: النماذج التفاعلية ===== */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#F5F1E8] overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-[#2E7D32] px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 text-white cursor-pointer">
              <Leaf className="w-6 h-6" />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                حصاد
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {mode === "login" && (
              <LoginForm
                isLoading={isLoading}
                onSubmit={handleLogin}
                onSelectAccountType={() => setMode("account-type")}
                form={loginForm}
                setForm={setLoginForm}
                onSocialLogin={handleSocialLogin}
              />
            )}

            {mode === "account-type" && (
              <AccountTypeSelect
                onSelect={(newMode) => {
                  setMode(newMode);
                  setStep(1);
                }}
                onBackToLogin={resetToLogin}
              />
            )}

            {mode === "register-farmer" && (
              <FarmerRegisterForm
                isLoading={isLoading}
                onSubmit={handleFarmerRegister}
                onBackToAccountType={() => setMode("account-type")}
                onBackToLogin={resetToLogin}
                form={farmerForm}
                setForm={setFarmerForm}
                step={step}
                setStep={setStep}
                agreedToTerms={agreedToTerms}
                setAgreedToTerms={setAgreedToTerms}
              />
            )}

            {mode === "register-provider" && (
              <ProviderRegisterForm
                isLoading={isLoading}
                onSubmit={handleProviderRegister}
                onBackToAccountType={() => setMode("account-type")}
                onBackToLogin={resetToLogin}
                form={providerForm}
                setForm={setProviderForm}
                step={step}
                setStep={setStep}
                selectedSpecialty={selectedSpecialty}
                setSelectedSpecialty={setSelectedSpecialty}
                agreedToTerms={agreedToTerms}
                setAgreedToTerms={setAgreedToTerms}
              />
            )}

            {mode === "register-supplier" && (
              <SupplierRegisterForm
                isLoading={isLoading}
                onSubmit={handleSupplierRegister}
                onBackToAccountType={() => setMode("account-type")}
                onBackToLogin={resetToLogin}
                form={supplierForm}
                setForm={setSupplierForm}
                step={step}
                setStep={setStep}
                agreedToTerms={agreedToTerms}
                setAgreedToTerms={setAgreedToTerms}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
