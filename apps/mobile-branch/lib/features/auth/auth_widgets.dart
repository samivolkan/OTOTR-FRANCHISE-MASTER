import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class AuthShell extends StatelessWidget {
  const AuthShell({
    super.key,
    required this.children,
    this.title,
    this.subtitle,
    this.showHero = true,
    this.centerContent = false,
  });

  final List<Widget> children;
  final String? title;
  final String? subtitle;
  final bool showHero;
  final bool centerContent;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.authBg,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: 430,
                    minHeight: constraints.maxHeight - 32,
                  ),
                  child: Column(
                    mainAxisAlignment: centerContent
                        ? MainAxisAlignment.center
                        : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AuthHeader(
                        title: title,
                        subtitle: subtitle,
                        showHero: showHero,
                      ),
                      const SizedBox(height: 18),
                      ...children,
                      const SizedBox(height: 18),
                      const Text(
                        'v2.4.1',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.grayText,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class AuthHeader extends StatelessWidget {
  const AuthHeader({
    super.key,
    this.title,
    this.subtitle,
    this.showHero = true,
  });

  final String? title;
  final String? subtitle;
  final bool showHero;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const AuthLogo(),
            const Spacer(),
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.white,
                border: Border.all(color: AppColors.grayBorder),
                borderRadius: BorderRadius.circular(15),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 18,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(
                Icons.verified_user_outlined,
                color: AppColors.brandRed,
              ),
            ),
          ],
        ),
        if (showHero) ...[
          const SizedBox(height: 20),
          const AuthVehicleHero(),
        ],
        if (title != null) ...[
          const SizedBox(height: 20),
          Text(
            title!,
            style: const TextStyle(
              color: AppColors.graphite,
              fontSize: 27,
              fontWeight: FontWeight.w900,
              height: 1.08,
            ),
          ),
        ],
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            style: AppTextStyles.muted.copyWith(
              color: const Color(0xFF596170),
              fontSize: 14,
            ),
          ),
        ],
      ],
    );
  }
}

class AuthLogo extends StatelessWidget {
  const AuthLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: const TextSpan(
            style: TextStyle(
              color: AppColors.graphite,
              fontSize: 34,
              fontWeight: FontWeight.w900,
              fontStyle: FontStyle.italic,
              letterSpacing: 0,
            ),
            children: [
              TextSpan(text: 'OTOT'),
              TextSpan(
                text: 'R',
                style: TextStyle(color: AppColors.brandRed),
              ),
            ],
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          AppConstants.brandPositioning,
          style: TextStyle(
            color: AppColors.grayText,
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 0,
          ),
        ),
      ],
    );
  }
}

class AuthVehicleHero extends StatelessWidget {
  const AuthVehicleHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 152,
      decoration: BoxDecoration(
        color: AppColors.graphiteSurface,
        borderRadius: BorderRadius.circular(30),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 24,
            offset: Offset(0, 14),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: Stack(
          fit: StackFit.expand,
          children: [
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF20242B),
                    Color(0xFF111317),
                    Color(0xFF2A080B),
                  ],
                ),
              ),
            ),
            Positioned.fill(
              child: CustomPaint(
                painter: _VehicleSilhouettePainter(),
              ),
            ),
            Positioned(
              left: 22,
              right: 22,
              bottom: 22,
              child: CustomPaint(
                painter: _RedWavePainter(),
                child: const SizedBox(height: 30),
              ),
            ),
            const Positioned(
              left: 22,
              top: 18,
              child: Text(
                'Güvenli operasyon girişi',
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const Positioned(
              right: 20,
              top: 18,
              child: Icon(
                Icons.lock_outline,
                color: AppColors.white,
                size: 23,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AuthCard extends StatelessWidget {
  const AuthCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(22),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.grayBorder),
        borderRadius: BorderRadius.circular(28),
        boxShadow: const [
          BoxShadow(
            color: Color(0x16000000),
            blurRadius: 28,
            offset: Offset(0, 16),
          ),
        ],
      ),
      child: child,
    );
  }
}

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.label,
    required this.icon,
    this.controller,
    this.keyboardType,
    this.obscureText = false,
    this.validator,
    this.onToggleObscure,
    this.inputFormatters,
    this.textInputAction,
  });

  final String label;
  final IconData icon;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final bool obscureText;
  final String? Function(String?)? validator;
  final VoidCallback? onToggleObscure;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      inputFormatters: inputFormatters,
      textInputAction: textInputAction,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.graphite),
        suffixIcon: onToggleObscure == null
            ? null
            : IconButton(
                onPressed: onToggleObscure,
                icon: Icon(
                  obscureText
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
        filled: true,
        fillColor: const Color(0xFFFAFBFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppColors.inputBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppColors.inputBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: AppColors.brandRed, width: 1.4),
        ),
      ),
    );
  }
}

class AuthPrimaryButton extends StatelessWidget {
  const AuthPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon = Icons.arrow_forward,
    this.tapKey,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData icon;
  final Key? tapKey;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.brandRed, AppColors.brandRedDark],
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: const [
            BoxShadow(
              color: Color(0x2ED60812),
              blurRadius: 18,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            key: tapKey,
            borderRadius: BorderRadius.circular(18),
            onTap: onPressed,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      label,
                      maxLines: 1,
                      style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Icon(icon, color: AppColors.white, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class AuthSecondaryButton extends StatelessWidget {
  const AuthSecondaryButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.graphite,
          side: const BorderSide(color: AppColors.grayBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
        icon: Icon(icon, size: 20),
        label: Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}

class BranchCard extends StatelessWidget {
  const BranchCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.redSoft : const Color(0xFFFAFBFC),
          border: Border.all(
            color: selected ? AppColors.brandRed : AppColors.grayBorder,
            width: selected ? 1.4 : 1,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: selected ? AppColors.brandRed : AppColors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: selected ? AppColors.brandRed : AppColors.grayBorder,
                ),
              ),
              child: Icon(
                Icons.location_on_outlined,
                color: selected ? AppColors.white : AppColors.graphite,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.darkText,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: AppTextStyles.muted,
                  ),
                ],
              ),
            ),
            Icon(
              selected ? Icons.check_circle : Icons.circle_outlined,
              color: selected ? AppColors.brandRed : AppColors.grayText,
            ),
          ],
        ),
      ),
    );
  }
}

class AuthNotice extends StatelessWidget {
  const AuthNotice({
    super.key,
    required this.text,
    this.icon = Icons.shield_outlined,
  });

  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8FA),
        border: Border.all(color: AppColors.grayBorder),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.brandRed, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.muted.copyWith(
                color: AppColors.darkText,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VehicleSilhouettePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.12)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;

    final body = Path()
      ..moveTo(size.width * 0.17, size.height * 0.61)
      ..cubicTo(
        size.width * 0.28,
        size.height * 0.42,
        size.width * 0.40,
        size.height * 0.33,
        size.width * 0.58,
        size.height * 0.35,
      )
      ..cubicTo(
        size.width * 0.74,
        size.height * 0.36,
        size.width * 0.84,
        size.height * 0.48,
        size.width * 0.90,
        size.height * 0.61,
      )
      ..lineTo(size.width * 0.84, size.height * 0.69)
      ..lineTo(size.width * 0.22, size.height * 0.69)
      ..close();

    canvas.drawPath(body, paint);
    canvas.drawCircle(
      Offset(size.width * 0.31, size.height * 0.70),
      12,
      paint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.74, size.height * 0.70),
      12,
      paint,
    );

    final windowPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;
    final windowPath = Path()
      ..moveTo(size.width * 0.40, size.height * 0.43)
      ..lineTo(size.width * 0.55, size.height * 0.39)
      ..lineTo(size.width * 0.66, size.height * 0.49)
      ..lineTo(size.width * 0.36, size.height * 0.50)
      ..close();
    canvas.drawPath(windowPath, windowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _RedWavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = const LinearGradient(
        colors: [AppColors.brandRedDark, AppColors.brandRed, Color(0xFFFF3039)],
      ).createShader(Offset.zero & size)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(0, size.height * 0.62)
      ..cubicTo(
        size.width * 0.20,
        size.height * 0.12,
        size.width * 0.36,
        size.height * 0.85,
        size.width * 0.55,
        size.height * 0.35,
      )
      ..cubicTo(
        size.width * 0.70,
        -2,
        size.width * 0.84,
        size.height,
        size.width,
        size.height * 0.40,
      );
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
