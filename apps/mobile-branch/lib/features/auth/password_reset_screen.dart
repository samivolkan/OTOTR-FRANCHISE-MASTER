import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../data/services/password_recovery_service.dart';
import 'auth_widgets.dart';

enum ResetChannel { phone, email }

class PasswordResetScreen extends StatefulWidget {
  const PasswordResetScreen({
    super.key,
    this.recoveryService = const SupabasePasswordRecoveryService(),
  });

  final PasswordRecoveryService recoveryService;

  @override
  State<PasswordResetScreen> createState() => _PasswordResetScreenState();
}

class _PasswordResetScreenState extends State<PasswordResetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _contactController = TextEditingController();
  ResetChannel _channel = ResetChannel.phone;
  bool _isSending = false;

  @override
  void dispose() {
    _contactController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      showHero: false,
      title: 'Hesabinizi Dogrulayin',
      subtitle:
          'Sifrenizi sifirlamak icin kayitli telefon numaranizi veya e-posta adresinizi girin.',
      children: [
        AuthCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SegmentedButton<ResetChannel>(
                  segments: const [
                    ButtonSegment(
                      value: ResetChannel.phone,
                      label: Text('Telefon'),
                      icon: Icon(Icons.phone_android_outlined),
                    ),
                    ButtonSegment(
                      value: ResetChannel.email,
                      label: Text('E-posta'),
                      icon: Icon(Icons.mail_outline),
                    ),
                  ],
                  selected: {_channel},
                  style: ButtonStyle(
                    foregroundColor: WidgetStateProperty.resolveWith(
                      (states) => states.contains(WidgetState.selected)
                          ? AppColors.white
                          : AppColors.graphite,
                    ),
                    backgroundColor: WidgetStateProperty.resolveWith(
                      (states) => states.contains(WidgetState.selected)
                          ? AppColors.brandRed
                          : AppColors.white,
                    ),
                  ),
                  onSelectionChanged: (value) {
                    setState(() {
                      _channel = value.first;
                      _contactController.clear();
                    });
                  },
                ),
                const SizedBox(height: 16),
                AuthTextField(
                  label: _channel == ResetChannel.phone
                      ? 'Personel telefonu'
                      : 'Personel e-postasi',
                  icon: _channel == ResetChannel.phone
                      ? Icons.phone_android_outlined
                      : Icons.mail_outline,
                  controller: _contactController,
                  keyboardType: _channel == ResetChannel.phone
                      ? TextInputType.phone
                      : TextInputType.emailAddress,
                  validator: _contactValidator,
                ),
                const SizedBox(height: 16),
                AuthPrimaryButton(
                  tapKey: const ValueKey('auth-reset-send'),
                  label: _isSending
                      ? 'Gonderiliyor'
                      : _channel == ResetChannel.phone
                          ? 'SMS Kodu Gonder'
                          : 'Sifirlama E-postasi Gonder',
                  icon: Icons.sms_outlined,
                  onPressed: _isSending ? null : _sendCode,
                ),
                const SizedBox(height: 10),
                AuthSecondaryButton(
                  label: 'Giris ekranina don',
                  icon: Icons.arrow_back,
                  onPressed: () => Navigator.pop(context),
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

  String? _contactValidator(String? value) {
    final requiredError = _requiredValidator(value);
    if (requiredError != null) {
      return requiredError;
    }
    final contact = value!.trim();
    if (_channel == ResetChannel.email &&
        !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(contact)) {
      return 'Gecerli bir e-posta girin';
    }
    final phoneDigits = contact.replaceAll(RegExp(r'\D'), '');
    if (_channel == ResetChannel.phone && phoneDigits.length < 10) {
      return 'Gecerli bir telefon numarasi girin';
    }
    return null;
  }

  Future<void> _sendCode() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => _isSending = true);
    try {
      final request = await widget.recoveryService.sendCode(
        channel: _channel == ResetChannel.phone
            ? PasswordRecoveryChannel.phone
            : PasswordRecoveryChannel.email,
        contact: _contactController.text,
      );
      if (!mounted) {
        return;
      }
      final message = request.isLive
          ? request.channel == PasswordRecoveryChannel.phone
              ? 'Telefonunuza dogrulama kodu gonderildi.'
              : 'E-posta adresinize sifirlama baglantisi gonderildi.'
          : 'Canli baglanti yok. Demo dogrulama akisi acildi.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
      Navigator.pushNamed(
        context,
        AppRoutes.passwordCode,
        arguments: PasswordRecoveryFlowArgs(
          request: request,
          service: widget.recoveryService,
        ),
      );
    } on PasswordRecoveryException catch (error) {
      _showError(error.message);
    } catch (_) {
      _showError(
        'Dogrulama istegi gonderilemedi. Bilgilerinizi kontrol edip tekrar deneyin.',
      );
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class OtpVerificationScreen extends StatefulWidget {
  const OtpVerificationScreen({
    super.key,
    this.args,
  });

  final PasswordRecoveryFlowArgs? args;

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isVerifying = false;

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final focusNode in _focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      showHero: false,
      title: 'Dogrulama Kodunu Girin',
      subtitle: _subtitle,
      children: [
        AuthCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  for (var index = 0; index < _controllers.length; index++)
                    SizedBox(
                      width: 45,
                      child: TextField(
                        controller: _controllers[index],
                        focusNode: _focusNodes[index],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(1),
                        ],
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        onChanged: (value) {
                          if (value.isNotEmpty &&
                              index < _focusNodes.length - 1) {
                            _focusNodes[index + 1].requestFocus();
                          }
                        },
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                'Kodu tekrar gonder: 00:45',
                textAlign: TextAlign.center,
                style: AppTextStyles.muted.copyWith(
                  color: AppColors.graphite,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 18),
              AuthPrimaryButton(
                tapKey: const ValueKey('auth-otp-verify'),
                label: _isVerifying ? 'Dogrulaniyor' : 'Dogrula',
                icon: Icons.check,
                onPressed: _isVerifying ? null : _verifyCode,
              ),
              const SizedBox(height: 10),
              AuthSecondaryButton(
                label: 'Geri don',
                icon: Icons.arrow_back,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String get _subtitle {
    final request = widget.args?.request;
    if (request?.channel == PasswordRecoveryChannel.email) {
      return 'E-postaniza gonderilen kodu veya baglantidaki dogrulamayi kullanarak devam edin.';
    }
    return 'Telefonunuza gonderilen 6 haneli kodu girerek devam edin.';
  }

  Future<void> _verifyCode() async {
    final args = widget.args;
    final code = _controllers.map((controller) => controller.text).join();
    if (args == null) {
      Navigator.pushNamed(context, AppRoutes.newPassword);
      return;
    }

    setState(() => _isVerifying = true);
    try {
      await args.service.verifyCode(
        request: args.request,
        code: code,
      );
      if (!mounted) {
        return;
      }
      Navigator.pushNamed(
        context,
        AppRoutes.newPassword,
        arguments: args,
      );
    } on PasswordRecoveryException catch (error) {
      _showError(error.message);
    } catch (_) {
      _showError('Kod dogrulanamadi. Tekrar deneyin.');
    } finally {
      if (mounted) {
        setState(() => _isVerifying = false);
      }
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class NewPasswordScreen extends StatefulWidget {
  const NewPasswordScreen({
    super.key,
    this.args,
  });

  final PasswordRecoveryFlowArgs? args;

  @override
  State<NewPasswordScreen> createState() => _NewPasswordScreenState();
}

class _NewPasswordScreenState extends State<NewPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _repeatController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureRepeat = true;
  bool _isUpdating = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _repeatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      showHero: false,
      title: 'Yeni Sifrenizi Olusturun',
      subtitle: 'Yeni sifreniz guclu ve sadece size ait olmalidir.',
      children: [
        AuthCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AuthTextField(
                  label: 'Yeni Sifre',
                  icon: Icons.lock_outline,
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  validator: _passwordValidator,
                  onToggleObscure: () {
                    setState(() => _obscurePassword = !_obscurePassword);
                  },
                ),
                const SizedBox(height: 14),
                AuthTextField(
                  label: 'Yeni Sifre Tekrar',
                  icon: Icons.lock_reset_outlined,
                  controller: _repeatController,
                  obscureText: _obscureRepeat,
                  validator: _repeatValidator,
                  onToggleObscure: () {
                    setState(() => _obscureRepeat = !_obscureRepeat);
                  },
                ),
                const SizedBox(height: 16),
                const _PasswordRules(),
                const SizedBox(height: 18),
                AuthPrimaryButton(
                  tapKey: const ValueKey('auth-new-password-submit'),
                  label: _isUpdating ? 'Guncelleniyor' : 'Sifreyi Guncelle',
                  icon: Icons.check_circle_outline,
                  onPressed: _isUpdating ? null : _updatePassword,
                ),
                const SizedBox(height: 10),
                AuthSecondaryButton(
                  label: 'Giris ekranina don',
                  icon: Icons.arrow_back,
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      AppRoutes.login,
                      (_) => false,
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String? _passwordValidator(String? value) {
    final password = value ?? '';
    if (password.length < 8) {
      return 'En az 8 karakter olmalidir';
    }
    if (!RegExp(r'[A-Z]').hasMatch(password)) {
      return 'En az 1 buyuk harf olmalidir';
    }
    if (!RegExp(r'[a-z]').hasMatch(password)) {
      return 'En az 1 kucuk harf olmalidir';
    }
    if (!RegExp(r'\d').hasMatch(password)) {
      return 'En az 1 rakam olmalidir';
    }
    return null;
  }

  String? _repeatValidator(String? value) {
    if (value != _passwordController.text) {
      return 'Sifreler eslesmiyor';
    }
    return null;
  }

  Future<void> _updatePassword() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => _isUpdating = true);
    try {
      final args = widget.args;
      if (args != null) {
        await args.service.updatePassword(
          request: args.request,
          password: _passwordController.text,
        );
      }
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sifreniz guncellendi.')),
      );
      Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (_) => false);
    } on PasswordRecoveryException catch (error) {
      _showError(error.message);
    } catch (_) {
      _showError('Sifre guncellenemedi. Tekrar deneyin.');
    } finally {
      if (mounted) {
        setState(() => _isUpdating = false);
      }
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class PasswordRecoveryFlowArgs {
  const PasswordRecoveryFlowArgs({
    required this.request,
    required this.service,
  });

  final PasswordRecoveryRequest request;
  final PasswordRecoveryService service;
}

class _PasswordRules extends StatelessWidget {
  const _PasswordRules();

  @override
  Widget build(BuildContext context) {
    const rules = [
      'En az 8 karakter',
      '1 buyuk harf',
      '1 kucuk harf',
      '1 rakam',
    ];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8FA),
        border: Border.all(color: AppColors.grayBorder),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sifre gereksinimleri',
            style: TextStyle(
              color: AppColors.darkText,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          for (final rule in rules)
            Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle_outline,
                    color: AppColors.success,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(rule, style: AppTextStyles.muted),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
