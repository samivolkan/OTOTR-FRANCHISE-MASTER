import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/constants/app_sizes.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_colors.dart';

class StartProofSuccessScreen extends StatefulWidget {
  const StartProofSuccessScreen({super.key, required this.workOrderId});

  final String workOrderId;

  @override
  State<StartProofSuccessScreen> createState() => _StartProofSuccessScreenState();
}

class _StartProofSuccessScreenState extends State<StartProofSuccessScreen>
    with SingleTickerProviderStateMixin {
  static const _duration = Duration(milliseconds: 1700);
  late final AnimationController _animationController;
  Timer? _redirectTimer;
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, duration: _duration)
      ..addListener(() {
        if (mounted && _animationController.value >= 1 && !_isCompleted) {
          setState(() => _isCompleted = true);
        }
      });

    _animationController.forward();
    _redirectTimer = Timer(_duration, _goToTasks);
  }

  @override
  void dispose() {
    _redirectTimer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  void _goToTasks() {
    if (!mounted) {
      return;
    }
    Navigator.pushReplacementNamed(
      context,
      AppRoutes.technicianTasks,
      arguments: widget.workOrderId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grayBg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'İŞ BAŞLADI',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 42,
                  color: AppColors.red,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 18),
              const Icon(
                Icons.verified,
                size: 94,
                color: AppColors.success,
              ),
              const SizedBox(height: 24),
              const Text(
                'İş başlatıldı!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              const Text(
                'Bu kanıt başarıyla kaydedildi ve Ekspertiz başlığına geçiş için hazır.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: AppColors.grayText),
              ),
              const SizedBox(height: 20),
              const Divider(color: AppColors.grayBorder),
              const SizedBox(height: 16),
              _buildStatusChip(),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '3 fotoğraflık kanıt kaydı başarıyla alındı.',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'AI netlik kontrolü tamamlandı.',
                      style: TextStyle(color: AppColors.grayText),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Saat kaydedildi: 12 Mayıs 2025 • 10:30',
                      style: TextStyle(color: AppColors.darkText),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Bir sonraki ekrana yönlendiriliyorsunuz...',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: AppColors.grayText),
              ),
              const SizedBox(height: 10),
              Text(
                _isCompleted ? 'Tamamlandı!' : '',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 16),
              Stack(
                alignment: Alignment.centerRight,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      minHeight: 10,
                      value: _animationController.value,
                      backgroundColor: AppColors.redSoft,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.red),
                    ),
                  ),
                  AnimatedOpacity(
                    opacity: _isCompleted ? 1 : 0,
                    duration: const Duration(milliseconds: 220),
                    child: const Padding(
                      padding: EdgeInsets.only(right: 2),
                      child: Icon(Icons.check_circle, color: AppColors.red),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 26),
              const Text(
                'Ekspertiz Başlıkları',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.navy,
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Ekspertiz sürecine başlamak için başlığa yönlendiriliyorsunuz.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.grayText),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.redSoft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.red),
      ),
      padding: const EdgeInsets.all(10),
      child: Row(
        children: [
          const Icon(Icons.shield_outlined, color: AppColors.red),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'İş kanıtı kaydı tamamlandı',
              style: const TextStyle(
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
