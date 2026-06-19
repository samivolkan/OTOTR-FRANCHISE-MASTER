import 'package:flutter/material.dart';

import '../../core/constants/app_strings.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';
import 'auth_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identityController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = true;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identityController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      title: 'Hesabınıza Giriş Yapın',
      subtitle:
          'Bayi portalı üzerinden tanımlanan kullanıcı bilgilerinizle giriş yapın.',
      children: [
        AuthCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AuthTextField(
                  label: 'Telefon / E-posta',
                  icon: Icons.person_outline,
                  controller: _identityController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  validator: _requiredValidator,
                ),
                const SizedBox(height: 14),
                AuthTextField(
                  label: 'Şifre',
                  icon: Icons.lock_outline,
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  validator: _requiredValidator,
                  onToggleObscure: () {
                    setState(() => _obscurePassword = !_obscurePassword);
                  },
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Checkbox(
                      value: _rememberMe,
                      activeColor: AppColors.brandRed,
                      onChanged: (value) {
                        setState(() => _rememberMe = value ?? false);
                      },
                    ),
                    const Expanded(
                      child: Text(
                        'Beni Hatırla',
                        style: TextStyle(
                          color: AppColors.darkText,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.passwordReset);
                      },
                      child: const Text(
                        'Şifremi Unuttum',
                        style: TextStyle(
                          color: AppColors.brandRed,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                AuthPrimaryButton(
                  tapKey: const ValueKey('auth-login-submit'),
                  label: AppStrings.login,
                  icon: Icons.arrow_forward,
                  onPressed: _submitLogin,
                ),
                const SizedBox(height: 12),
                AuthSecondaryButton(
                  label: 'Teknik Destek',
                  icon: Icons.support_agent_outlined,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Teknik destek talebi bayi portalı üzerinden takip edilir.',
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                const AuthNotice(
                  text:
                      'Kullanıcı bilgileriniz bayi portalı üzerinden tanımlanır.',
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Bu alan zorunludur';
    }
    return null;
  }

  void _submitLogin() {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    final password = _passwordController.text.trim().toLowerCase();
    if (password == 'hata' || password == 'wrong') {
      Navigator.pushNamed(context, AppRoutes.invalidPassword);
      return;
    }
    Navigator.pushReplacementNamed(context, AppRoutes.branchSelection);
  }
}
